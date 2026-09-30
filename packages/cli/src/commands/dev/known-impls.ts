/**
 * Closed allowlist of Cloudflare-shipped dev-server implementations.
 *
 * cf does not run a dev server itself — it discovers which impl is
 * installed in the user's project (one per project, picked by the
 * project's manifest) and spawns its delegate binary as a subprocess.
 *
 * Adding an entry to this list is a deliberate cf release: the impl
 * must ship a delegate binary at the path declared below, and that
 * binary must accept a `dev` subcommand per the subprocess contract
 * (long-running with inherited stdio and forwarded signals).
 *
 * Each impl owns its own binary name (`cf-vite`, `cf-wrangler`, etc.)
 * so the impl can grow more subcommands later (`build`, `deploy`)
 * without needing a separate executable per concern. The dev-loop
 * is just one subcommand of the impl's overall delegate surface.
 *
 * This file is product knowledge in `src/`, but it's the same
 * unavoidable kind as "cf is the CLI for Cloudflare" — there's no
 * forge-side representation for "which dev-server packages exist."
 */
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** The package ecosystems cf knows about. */
export type Ecosystem = "npm" | "pypi" | "cargo";

/**
 * A known dev-server implementation.
 *
 * `binary(ctx)` resolves the impl's delegate executable from a
 * discovery context; the discoverer fills in the right shape
 * (resolved package root for npm, Python environment hint for PyPI,
 * etc.). The function returns `null` when the impl is declared in the
 * manifest but the binary can't be located on disk — the caller
 * surfaces an impl-specific install hint.
 */
export interface KnownImpl {
	ecosystem: Ecosystem;
	/** Package name as it appears in the project manifest. */
	pkg: string;
	/** Fallback impls are used only when no primary impl is declared. */
	fallback?: boolean;
	/** Installed-package compatibility and the requirement shown to users. */
	versionConstraint?: {
		range: string;
		display: string;
	};
	/** Friendly description used in error messages. */
	description: string;
	/** Manifest file the discoverer reads. */
	manifest: string;
	/** Resolve the impl's delegate binary path. */
	binary(ctx: ImplResolutionContext): string | null;
	/** Hint surfaced when the impl is the only known one and it isn't installed. */
	installHint: string;
}

/** Resolution context passed to `KnownImpl.binary`. Filled in by the discoverer. */
export interface ImplResolutionContext {
	/** Project root (cwd at time of `cf dev` invocation). */
	cwd: string;
	/**
	 * For npm impls: resolved package root inside `node_modules`.
	 * For PyPI / Cargo impls: undefined (resolution is ecosystem-specific).
	 */
	pkgRoot?: string;
}

/**
 * Build a resolver for a per-impl npm binary.
 *
 * Each impl ships its delegate at `<pkgRoot>/bin/<binaryName>` (the
 * file is committed with `chmod +x` in the impl's source repo). The
 * resolver returns the absolute path if the file exists, or null
 * (which the caller surfaces with the impl's install hint).
 */
function npmBinaryResolver(
	binaryName: string
): (ctx: ImplResolutionContext) => string | null {
	return (ctx) => {
		if (!ctx.pkgRoot) {
			return null;
		}
		const path = join(ctx.pkgRoot, "bin", binaryName);
		if (existsSync(path)) {
			return path;
		}
		return null;
	};
}

/**
 * Resolve the `cloudflare-rs-dev-server` binary in `$CARGO_HOME/bin`.
 *
 * The impl is a crate with a `[[bin]]` entry; users get it on PATH via
 * `cargo install cloudflare-rs-dev-server` or via cargo's per-project
 * `target/debug/` build (out of scope for v1 — the binary must be on
 * the global cargo bin path).
 */
function resolveCargoBinary(): string | null {
	const cargoHome = process.env.CARGO_HOME ?? join(homedir(), ".cargo");
	const candidate = join(cargoHome, "bin", "cloudflare-rs-dev-server");
	if (existsSync(candidate)) {
		return candidate;
	}
	return null;
}

/**
 * Static allowlist. Order is presentational only — used in install
 * hints when no impl is found, and to make multi-impl error output
 * deterministic.
 */
export const KNOWN_IMPLS: readonly KnownImpl[] = [
	{
		ecosystem: "npm",
		pkg: "@cloudflare/vite-plugin",
		versionConstraint: {
			range: ">=2.0.0-0 <3.0.0-0",
			display: "@cloudflare/vite-plugin v2 beta",
		},
		description:
			"Vite-based dev server (recommended for JavaScript/TypeScript)",
		manifest: "package.json",
		binary: npmBinaryResolver("cf-vite"),
		installHint: "npm install --save-dev @cloudflare/vite-plugin@beta",
	},
	{
		ecosystem: "npm",
		pkg: "wrangler",
		fallback: true,
		versionConstraint: {
			range: ">=4.136.0",
			display: "wrangler@4.136.0 or newer",
		},
		description: "Wrangler-based dev server (legacy Worker projects)",
		manifest: "package.json",
		binary: npmBinaryResolver("cf-wrangler.js"),
		installHint: "npm install --save-dev wrangler@latest",
	},
	{
		ecosystem: "pypi",
		pkg: "cloudflare-py-dev-server",
		description: "Python dev server (Pyodide via workerd)",
		manifest: "pyproject.toml",
		// Resolved separately by the PyPI discoverer (uses the project's
		// active Python environment). The discoverer fills in the binary
		// path directly; this stub returns null and is unreachable in
		// practice.
		binary: () => null,
		installHint:
			"pip install cloudflare-py-dev-server   (or: uv add --dev cloudflare-py-dev-server)",
	},
	{
		ecosystem: "cargo",
		pkg: "cloudflare-rs-dev-server",
		description: "Rust dev server (wasm-bindgen + workerd)",
		manifest: "Cargo.toml",
		binary: resolveCargoBinary,
		installHint: "cargo install cloudflare-rs-dev-server",
	},
] as const;

/** Look up a known impl by package name. */
export function findKnownImpl(pkg: string): KnownImpl | undefined {
	return KNOWN_IMPLS.find((impl) => impl.pkg === pkg);
}
