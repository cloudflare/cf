/**
 * Per-ecosystem discovery for `cf dev`.
 *
 * cf walks the project's manifest in each known ecosystem
 * (`package.json`, `pyproject.toml`, `Cargo.toml`) and returns every
 * declared impl. The caller (`commands/dev/index.ts`) enforces the
 * "exactly one impl per project" rule.
 *
 * Discovery is read-only and synchronous (modulo Python's child-process
 * resolution); no file mutations, no network. If the manifest declares
 * an impl but the binary can't be resolved on disk, the result carries
 * a `binary: null` so the caller can surface a "declared but not
 * installed" error with the impl's `installHint`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { findKnownImpl, type KnownImpl } from "./known-impls.js";

/**
 * The result of discovering a single declared impl.
 *
 * `declared` is always true for entries returned from `discoverImpls`.
 * `binary` is the resolved path to the impl's executable, or null if
 * the impl is declared in the manifest but not installed (e.g.
 * `package.json` mentions `@cloudflare/vite-plugin` but
 * `node_modules/` is missing).
 */
export interface DiscoveredImpl {
	impl: KnownImpl;
	binary: string | null;
	/** True when the declared package itself is installed/resolved. */
	installed?: boolean;
	/** Installed npm package version, when readable from package.json. */
	installedVersion?: string;
	/** Path to the manifest that declared the impl (relative or absolute). */
	manifestPath: string;
}

/**
 * Walk all known ecosystems' manifests in `cwd` and return every
 * declared known impl.
 *
 * Multiple results is not an error here — the caller decides whether
 * to surface "multiple impls configured" or to pick one when the user
 * has been explicit (none of which exists today; for v1 we always hard
 * error on >1).
 */
export function discoverImpls(cwd: string): DiscoveredImpl[] {
	const results: DiscoveredImpl[] = [];
	results.push(...discoverNpm(cwd));
	results.push(...discoverPyPI(cwd));
	results.push(...discoverCargo(cwd));

	const primary = results.filter((result) => !result.impl.fallback);
	return primary.length > 0 ? primary : results;
}

// ---------------------------------------------------------------------------
// npm
// ---------------------------------------------------------------------------

interface PackageJsonShape {
	dependencies?: Record<string, unknown>;
	devDependencies?: Record<string, unknown>;
	peerDependencies?: Record<string, unknown>;
	optionalDependencies?: Record<string, unknown>;
}

function discoverNpm(cwd: string): DiscoveredImpl[] {
	const manifestPath = join(cwd, "package.json");
	if (!existsSync(manifestPath)) {
		return [];
	}

	let parsed: PackageJsonShape;
	try {
		const raw = readFileSync(manifestPath, "utf-8");
		parsed = JSON.parse(raw) as PackageJsonShape;
	} catch {
		// Unreadable / malformed package.json → caller will hit autoconfig
		// or surface its own error. Discovery treats it as no-match.
		return [];
	}

	const declared = collectDepNames(parsed);
	const out: DiscoveredImpl[] = [];

	for (const name of declared) {
		const impl = findKnownImpl(name);
		if (!impl || impl.ecosystem !== "npm") {
			continue;
		}

		// Resolve the package's installed root inside cwd's node_modules.
		// We deliberately do NOT use require.resolve(`${name}/package.json`)
		// because that walks up the directory tree and can pick up a
		// hoisted version from a workspace ancestor. cf must use the
		// package the user is actually working on (per AGENTS.md).
		const pkgRoot = resolveLocalNpmPackage(cwd, name);
		const binary = pkgRoot ? impl.binary({ cwd, pkgRoot }) : null;
		const installedVersion = pkgRoot
			? readInstalledNpmVersion(pkgRoot)
			: undefined;
		out.push({
			impl,
			binary,
			installed: Boolean(pkgRoot),
			installedVersion,
			manifestPath,
		});
	}

	return out;
}

/**
 * Collect dependency names from a parsed package.json across the four
 * standard fields. Returns a Set so a package declared in multiple
 * sections is reported once.
 */
function collectDepNames(pkg: PackageJsonShape): Set<string> {
	const names = new Set<string>();
	for (const field of [
		"dependencies",
		"devDependencies",
		"peerDependencies",
		"optionalDependencies",
	] as const) {
		const section = pkg[field];
		if (section && typeof section === "object") {
			for (const name of Object.keys(section)) {
				names.add(name);
			}
		}
	}
	return names;
}

/**
 * Look up a package's installed root in cwd's local `node_modules`,
 * not walking up the directory tree. Returns null if not present
 * (e.g. user hasn't run `npm install`).
 *
 * Workspace caveat: in pnpm/npm workspaces the package may live in a
 * hoisted location two directories up. cf prefers the local one — if
 * it isn't installed locally that's a real "not installed" signal.
 */
function resolveLocalNpmPackage(cwd: string, pkg: string): string | undefined {
	const candidate = join(cwd, "node_modules", pkg, "package.json");
	if (existsSync(candidate)) {
		return join(cwd, "node_modules", pkg);
	}
	return undefined;
}

function readInstalledNpmVersion(pkgRoot: string): string | undefined {
	try {
		const parsed = JSON.parse(
			readFileSync(join(pkgRoot, "package.json"), "utf8")
		) as { version?: unknown };
		return typeof parsed.version === "string" ? parsed.version : undefined;
	} catch {
		return undefined;
	}
}

// ---------------------------------------------------------------------------
// PyPI
// ---------------------------------------------------------------------------

function discoverPyPI(cwd: string): DiscoveredImpl[] {
	const manifestPath = join(cwd, "pyproject.toml");
	if (!existsSync(manifestPath)) {
		return [];
	}

	let raw: string;
	try {
		raw = readFileSync(manifestPath, "utf-8");
	} catch {
		return [];
	}

	const out: DiscoveredImpl[] = [];

	// We don't pull in a TOML parser dep just for membership tests —
	// each known PyPI impl has a unique package name, so a substring
	// match against the document under any of the known dependency
	// table headers is sufficient for "is this impl declared?". Real
	// resolution happens via the Python environment below.
	for (const impl of findAllPyPIImpls()) {
		if (!isPyPIDepDeclared(raw, impl.pkg)) {
			continue;
		}
		const binary = resolvePyPIBinary(cwd, impl.pkg);
		out.push({ impl, binary, manifestPath });
	}

	return out;
}

function findAllPyPIImpls(): KnownImpl[] {
	// Local helper; avoids importing the whole list when other ecosystems
	// don't need it (the static array is small but keeps things readable).
	const list: KnownImpl[] = [];
	const seen = new Set<string>();
	for (const impl of impls()) {
		if (impl.ecosystem === "pypi" && !seen.has(impl.pkg)) {
			list.push(impl);
			seen.add(impl.pkg);
		}
	}
	return list;
}

/**
 * Heuristic detection of a PyPI dep declaration in `pyproject.toml`
 * source. Looks for the package name appearing as a quoted string
 * inside any of the standard dependency tables (`[project]`,
 * `[dependency-groups]`, `[tool.uv]`, etc.).
 *
 * False positives are unlikely — known impl names are namespaced
 * enough (`cloudflare-py-dev-server`) that they don't collide with
 * unrelated comments or string literals in practice. False negatives
 * (impl is declared in a non-standard way) are surfaced as "not
 * installed" with the install hint, which is the same UX as a missing
 * impl.
 */
function isPyPIDepDeclared(raw: string, pkg: string): boolean {
	// Match `pkg`, `pkg==`, `pkg>=`, `pkg[extras]`, etc. as a quoted
	// string token. Anchored at a quote on the left and a separator
	// (whitespace, [, =, <, >, !, ~, ", ', or ;) on the right.
	const escaped = pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const re = new RegExp(`["']${escaped}(?=[\\s\\[<>=!~"';])`, "m");
	return re.test(raw);
}

/**
 * Resolve a PyPI impl's executable in the project's active Python
 * environment.
 *
 * Strategy:
 *   1. Prefer `uv run --no-sync <pkg> --version` if `uv.lock` exists
 *      (uv's `--no-sync` skips the slow lock-resolution step).
 *   2. Else fall back to plain `<pkg>` on PATH (assumes the user has
 *      activated their venv).
 *
 * Only the existence of the executable is asserted; we don't run the
 * impl here. Returns the path to the binary, or null if nothing
 * resolves.
 *
 * The uv-vs-PATH choice is encoded as the returned binary string —
 * "uv run pkg" vs "pkg" — and `spawn()` parses that downstream. This
 * keeps discovery's return type a simple string while letting the
 * spawner know to invoke uv.
 */
function resolvePyPIBinary(cwd: string, pkg: string): string | null {
	if (existsSync(join(cwd, "uv.lock"))) {
		// We don't actually verify the package is in the uv environment
		// here (that would require running `uv pip list` or similar,
		// which is slow). Trust the manifest declaration; if uv can't
		// find the package at spawn time the user gets uv's own clear
		// error message.
		return `uv:${pkg}`;
	}

	// Plain PATH lookup. We use Python itself to do the resolution
	// because cf may be running outside the user's venv; `python -c`
	// runs in whatever Python environment the user has activated.
	try {
		const out = execFileSync(
			"python3",
			[
				"-c",
				`import shutil, sys; p = shutil.which(${JSON.stringify(pkg)}); sys.stdout.write(p or "")`,
			],
			{ cwd, stdio: ["ignore", "pipe", "ignore"], encoding: "utf-8" }
		);
		const path = out.trim();
		if (path && existsSync(path)) {
			return path;
		}
	} catch {
		// `python3` not on PATH, or it errored — treat as not resolved.
	}
	return null;
}

// ---------------------------------------------------------------------------
// Cargo
// ---------------------------------------------------------------------------

function discoverCargo(cwd: string): DiscoveredImpl[] {
	const manifestPath = join(cwd, "Cargo.toml");
	if (!existsSync(manifestPath)) {
		return [];
	}

	let raw: string;
	try {
		raw = readFileSync(manifestPath, "utf-8");
	} catch {
		return [];
	}

	const out: DiscoveredImpl[] = [];
	for (const impl of impls()) {
		if (impl.ecosystem !== "cargo") {
			continue;
		}
		if (!isCargoDepDeclared(raw, impl.pkg)) {
			continue;
		}
		const binary = impl.binary({ cwd });
		out.push({ impl, binary, manifestPath });
	}
	return out;
}

/**
 * Detect a cargo dep declaration in `Cargo.toml` source.
 *
 * Crate names appear as bare keys (`pkg = "1.0"`) or table headers
 * (`[dependencies.pkg]`). The regex below accepts both forms under any
 * `[dependencies]` / `[build-dependencies]` / `[dev-dependencies]`
 * table — same false-positive caveat as the PyPI heuristic.
 */
function isCargoDepDeclared(raw: string, pkg: string): boolean {
	const escaped = pkg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	// `pkg =` at line start (after optional whitespace), OR
	// `[<table>.pkg]` table header.
	const re = new RegExp(
		`(^\\s*${escaped}\\s*=)|(^\\s*\\[[^\\]]*\\.${escaped}\\s*\\])`,
		"m"
	);
	return re.test(raw);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Lazy import of the static list to avoid a top-level cycle. */
function impls(): readonly KnownImpl[] {
	// Imported at module scope below; this indirection exists only so
	// the per-ecosystem helpers can iterate without each one importing
	// the same array under a different name.
	return KNOWN_IMPLS_REF;
}

import { KNOWN_IMPLS as KNOWN_IMPLS_REF } from "./known-impls.js";
