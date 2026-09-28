/**
 * Local-install delegation — cf's port of Wrangler 2's behaviour.
 *
 * When a globally-installed cf is invoked inside a project that pins
 * its own copy of cf in `node_modules`, cf re-executes that local copy
 * and exits with its status code. This keeps every collaborator and CI
 * job on the exact version a project pinned, regardless of which global
 * cf happens to be first on `PATH`.
 *
 * Ported from wrangler's historical `bin/wrangler.js` (`shouldDelegate`
 * + `runDelegatedWrangler`, removed in workers-sdk#3192), adapted to cf:
 *
 *   - ESM `createRequire`, not CJS `require`.
 *   - Provenance is surfaced through the cf banner rather than a
 *     separate stderr notice: the delegated child renders the banner
 *     (the global exits the moment it spawns the child) and keys off the
 *     `CF_DELEGATION` sentinel it was spawned with to append a dim
 *     "· delegated" tag to its banner.
 *   - Self-detection compares realpaths (robust to pnpm's symlinked
 *     `node_modules`), and a `CF_DELEGATION` env sentinel hard-stops any
 *     re-delegation loop ("refuse to delegate twice").
 *   - Explicit one-shot invocations — `npx cf@<version>`,
 *     `npx <prerelease-url>`, `pnpm dlx cf@…` / `pnpx …` — are honoured
 *     verbatim and never delegated to a project-local pin: the user
 *     pinned an exact copy to run *now*. They're detected by spotting
 *     the package manager's throwaway exec cache in the running
 *     install's own path (see `isEphemeralExecInstall`). A plain global
 *     `cf …` has no such cache segment and delegates as normal.
 *
 * The mechanism is product-agnostic — it knows nothing about which API
 * commands exist — so it upholds the `src/` "no product knowledge"
 * invariant.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { constants } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The npm package name users install both globally and per-project. */
const PACKAGE_NAME = "cf";

/**
 * Env var set on the delegated child. Two readers:
 *   1. the loop guard — if cf re-enters delegation with this already set
 *      (e.g. an exotic symlink layout defeats the realpath self-check
 *      below), we refuse to delegate again rather than fork-bomb (the
 *      realpath check is the primary guard; this is the backstop);
 *   2. the banner (`renderPromptIntro`, src/lib/ui/banner.ts) — its
 *      presence means "this is a delegated child", which the dim
 *      "· delegated" headline tag reflects.
 */
export const DELEGATION_SENTINEL = "CF_DELEGATION";

export interface DelegateResult {
	/** Whether a local cf was spawned. When true, `exitCode` is set. */
	delegated: boolean;
	/** The delegated child's exit code, to propagate via `CliExit`. */
	exitCode?: number;
}

/** A resolved local cf install cf can hand control to. */
interface DelegateTarget {
	/** Absolute path to the local install's `package.json`. */
	packageJsonPath: string;
	/** Absolute path to the local install's `cf` bin entry. */
	binPath: string;
	/** The local install's version, for the delegation notice. */
	version: string;
}

interface ResolveDeps {
	/** Directory to resolve the local install from. */
	cwd: string;
	/**
	 * Absolute path to the currently-running cf's own `package.json`, or
	 * null if it can't be located. Drives the realpath self-check and the
	 * ephemeral-exec guard.
	 */
	ownPackageJsonPath: string | null;
	/** Environment to read the loop-guard sentinel from. */
	env: NodeJS.ProcessEnv;
}

/**
 * Resolve the project-local cf install cf should delegate to, or null
 * when delegation shouldn't happen: no local install, we *are* the
 * local install, the loop guard is tripped, or we were launched as an
 * explicit one-shot `npx` / `pnpm dlx` exec (the user pinned this copy).
 *
 * Net effect — the *only* case that delegates is bare global usage: a
 * globally-installed cf run as plain `cf` inside a project that pins its
 * own copy. Every package-manager-mediated invocation is already handled
 * elsewhere: `pnpm cf` / `npm exec cf` run the pin directly (so the
 * self-check below no-ops), and `npx cf@x` / `pnpm dlx` are explicit
 * fetches (the exec-cache guard). We can't detect "global" positively
 * (prefixes are un-enumerable: nvm, volta, brew, pnpm-global, Windows…),
 * so we instead rule out the local pin and the exec caches and treat
 * what's left as a normal/global binary.
 *
 * Mirrors wrangler's `shouldDelegate` plus the package.json read from
 * `runDelegatedWrangler`, collapsed into a single resolution step.
 */
export function resolveDelegateTarget(
	deps: ResolveDeps
): DelegateTarget | null {
	// Loop guard: never delegate from within an already-delegated child.
	if (deps.env[DELEGATION_SENTINEL]) {
		return null;
	}

	// Honour explicit one-shot execs. `npx cf@<version>`,
	// `npx <prerelease-url>`, and `pnpm dlx cf@…` all run cf from the
	// package manager's throwaway exec cache — the user asked for *this*
	// copy, so never delegate to whatever a nearby project pins. A plain
	// global `cf …` runs from a global prefix (no cache segment) and
	// falls through to normal delegation below.
	if (isEphemeralExecInstall(deps.ownPackageJsonPath)) {
		return null;
	}

	// `require.resolve` throws if there's no local cf reachable from cwd.
	let localPackageJsonPath: string;
	try {
		const req = createRequire(resolve(deps.cwd, "package.json"));
		localPackageJsonPath = req.resolve(`${PACKAGE_NAME}/package.json`);
	} catch {
		return null;
	}

	// If the local install resolves to the install that's already
	// running, we're the pinned copy — there's nothing to delegate to.
	if (
		deps.ownPackageJsonPath &&
		isSamePath(localPackageJsonPath, deps.ownPackageJsonPath)
	) {
		return null;
	}

	let manifest: { version?: unknown; bin?: unknown };
	try {
		manifest = JSON.parse(readFileSync(localPackageJsonPath, "utf-8")) as {
			version?: unknown;
			bin?: unknown;
		};
	} catch {
		return null;
	}

	const binRelative = pickBinEntry(manifest.bin);
	if (!binRelative) {
		return null;
	}
	const binPath = resolve(dirname(localPackageJsonPath), binRelative);
	if (!existsSync(binPath)) {
		return null;
	}

	return {
		packageJsonPath: localPackageJsonPath,
		binPath,
		version:
			typeof manifest.version === "string" ? manifest.version : "unknown",
	};
}

export interface DelegateOptions {
	/** Directory to resolve the local install from (defaults to cwd). */
	cwd?: string;
	/** Args after `node <entry>` — defaults to `process.argv.slice(2)`. */
	argv?: string[];
	env?: NodeJS.ProcessEnv;
	/**
	 * Path to the running cf's own package.json. Defaults to a walk-up
	 * from this module; overridable for tests.
	 */
	ownPackageJsonPath?: string | null;
}

/**
 * If a project-local cf exists and isn't us, spawn it with the same
 * argv — forwarding stdio, signals, and IPC — and resolve with
 * `{ delegated: true, exitCode }`. Otherwise resolve `{ delegated:
 * false }` with no side effects.
 */
export async function maybeDelegateToLocalInstall(
	options: DelegateOptions = {}
): Promise<DelegateResult> {
	const cwd = options.cwd ?? process.cwd();
	const argv = options.argv ?? process.argv.slice(2);
	const env = options.env ?? process.env;
	const ownPackageJsonPath =
		options.ownPackageJsonPath === undefined
			? findOwnPackageJson()
			: options.ownPackageJsonPath;

	const target = resolveDelegateTarget({ cwd, ownPackageJsonPath, env });
	if (!target) {
		return { delegated: false };
	}

	// We don't print anything here: the child owns the terminal and
	// renders the banner (the global exits the moment the child is
	// spawned). The child learns it was delegated to via the
	// `CF_DELEGATION` sentinel runDelegated sets on it.
	const exitCode = await runDelegated(target.binPath, argv, env);
	return { delegated: true, exitCode };
}

/**
 * Entry-point wrapper, called from `bin/cf` *before* importing the main
 * bundle — so a delegating invocation never loads the global cf's
 * command tree. This is the SOLE delegation site: `main()` deliberately
 * does not delegate, so the `pnpm dev` / tsx and in-process test paths
 * always run the cf in this checkout rather than a cwd's pin.
 *
 * Reads argv from the process, skips the shell-completion callback (it
 * must stay fast and keep stdout machine-parseable), and delegates when
 * a project-local cf is pinned.
 */
export async function maybeDelegateFromProcess(): Promise<DelegateResult> {
	const argv = process.argv.slice(2);
	if (isCompletionInvocation(argv)) {
		return { delegated: false };
	}
	return maybeDelegateToLocalInstall({ argv });
}

/**
 * Detect the shell-completion command (`cf complete <shell>` installer
 * or the `cf complete -- <words…>` runtime callback) — the one path that
 * opts out of delegation.
 */
function isCompletionInvocation(argv: string[]): boolean {
	return argv.find((a) => !a.startsWith("-")) === "complete";
}

/**
 * Spawn the local cf bin under the current Node executable and wait for
 * it to exit. stdio is fully inherited so the child owns the terminal;
 * an IPC channel is wired (matching wrangler) so a parent embedding cf
 * still receives the child's messages. SIGINT/SIGTERM are relayed so
 * Ctrl-C reaches the delegated process.
 */
function runDelegated(
	binPath: string,
	argv: string[],
	env: NodeJS.ProcessEnv
): Promise<number> {
	return new Promise<number>((resolveExit, rejectExit) => {
		const child = spawn(process.execPath, [binPath, ...argv], {
			stdio: ["inherit", "inherit", "inherit", "ipc"],
			env: {
				...env,
				[DELEGATION_SENTINEL]: "1",
			},
		});

		// Forward any IPC messages up to whoever spawned *us* (if anyone).
		child.on("message", (message) => {
			if (process.send) {
				process.send(message);
			}
		});

		const relay = (signal: NodeJS.Signals) => () => {
			child.kill(signal);
		};
		const onSigInt = relay("SIGINT");
		const onSigTerm = relay("SIGTERM");
		process.on("SIGINT", onSigInt);
		process.on("SIGTERM", onSigTerm);

		const detach = () => {
			process.off("SIGINT", onSigInt);
			process.off("SIGTERM", onSigTerm);
		};

		child.once("exit", (code, signal) => {
			detach();
			if (code !== null) {
				resolveExit(code);
			} else if (signal) {
				// Killed by a signal → conventional 128 + N exit code.
				resolveExit(128 + (constants.signals[signal] ?? 1));
			} else {
				resolveExit(0);
			}
		});
		child.once("error", (error) => {
			detach();
			rejectExit(error);
		});
	});
}

/**
 * Pick the cf bin path from a package.json `bin` field, which may be a
 * bare string (`"./bin/cf"`) or a map (`{ cf: "./bin/cf" }`).
 */
function pickBinEntry(bin: unknown): string | null {
	if (typeof bin === "string") {
		return bin;
	}
	if (bin && typeof bin === "object") {
		const map = bin as Record<string, unknown>;
		const named = map[PACKAGE_NAME];
		if (typeof named === "string") {
			return named;
		}
		for (const value of Object.values(map)) {
			if (typeof value === "string") {
				return value;
			}
		}
	}
	return null;
}

/** Compare two paths by realpath, falling back to a normalised compare. */
function isSamePath(a: string, b: string): boolean {
	try {
		return realpathSync(a) === realpathSync(b);
	} catch {
		return resolve(a) === resolve(b);
	}
}

/**
 * Detect whether the *running* cf was launched as a one-shot
 * `npx cf@<version>` / `npx <prerelease-url>` (npm) or `pnpm dlx cf@…` /
 * `pnpx …` (pnpm). In those cases the user pinned an exact copy to run
 * right now, so cf must run it directly rather than delegating to
 * whatever a nearby project happens to pin.
 *
 * The tell is the running install's own path: npm fetches npx packages
 * into `<cache>/_npx/<hash>/…` and pnpm into `…/dlx-<pid>/…` or
 * `…/pnpm/dlx/<hash>/…`. Neither a global install (`cf …`) nor a
 * project-local pin sits under such a segment, so both delegate as
 * normal.
 *
 * Why the path and not an env var: there is no single env signal that
 * covers both managers. npm exports `npm_command=exec` /
 * `npm_lifecycle_event=npx`, but pnpm dlx sets nothing that
 * distinguishes it from a plain `pnpm` run — and npm's vars are
 * inherited by any child cf spawned under an unrelated `npx <tool>`,
 * which would wrongly suppress delegation. The binary's location can't
 * be faked that way.
 *
 * Segment-exact (not a substring) so a directory whose name merely
 * contains "dlx" isn't mistaken for a cache. npm + pnpm only by design;
 * yarn dlx and bunx use less stable temp shapes and are out of scope.
 */
function isEphemeralExecInstall(ownPackageJsonPath: string | null): boolean {
	if (!ownPackageJsonPath) {
		return false;
	}
	return ownPackageJsonPath
		.split(/[\\/]/)
		.some((seg) => seg === "_npx" || seg === "dlx" || seg.startsWith("dlx-"));
}

/**
 * Whether the running cf was launched as a one-shot `npx` / `pnpm dlx`
 * exec, in which case a bare `cf` is not expected to be on PATH.
 */
export function isEphemeralExecRun(): boolean {
	return isEphemeralExecInstall(findOwnPackageJson());
}

/**
 * Walk up from this module's location to the nearest `package.json` —
 * the running cf's own manifest. Works both bundled (`dist/index.mjs`
 * → `<pkg>/package.json`) and under tsx (`src/lib/delegate.ts` →
 * `packages/cli/package.json`).
 */
function findOwnPackageJson(): string | null {
	let dir = dirname(fileURLToPath(import.meta.url));
	for (;;) {
		const candidate = resolve(dir, "package.json");
		if (existsSync(candidate)) {
			return candidate;
		}
		const parent = dirname(dir);
		if (parent === dir) {
			return null;
		}
		dir = parent;
	}
}
