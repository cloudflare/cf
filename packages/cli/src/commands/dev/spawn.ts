/**
 * Long-running `cf dev` implementation subprocess.
 *
 * - cf locates the impl's delegate executable and invokes
 *   `<impl-binary> dev [argv]`.
 * - stdio is fully inherited; the impl owns the terminal.
 * - cf forwards SIGINT / SIGTERM and exits with the impl's exit code.
 * - There is no protocol pipe, no JSON handshake, no capabilities
 *   negotiation. The `dev` subcommand either exists on the impl's
 *   delegate or it doesn't — the impl's own "unknown command" error
 *   surfaces directly to the user, which IS the version check.
 *
 * The `dev` subcommand is one of (potentially several) that an impl's
 * delegate binary supports. Future subcommands like `build` / `deploy`
 * will follow the same shape: `<impl-binary> <verb> [argv]`.
 */
import { constants } from "node:os";
import { x } from "tinyexec";
import { getCloudflareRegistryEnvironment } from "../../lib/registry.js";
import type { CommandOutputOptions } from "../../lib/autoconfig.js";
import type { DiscoveredImpl } from "./discover.js";

export interface SpawnResult {
	exitCode: number;
	signal?: NodeJS.Signals;
}

interface SpawnOptions extends CommandOutputOptions {
	env?: Readonly<NodeJS.ProcessEnv>;
}

export function shouldRelaySignal(
	signal: NodeJS.Signals,
	platform: NodeJS.Platform = process.platform
): boolean {
	return platform !== "win32" || signal !== "SIGINT";
}

// Keep the termination cause separate from the numeric exit code. A delegate
// may handle a forwarded signal and exit 0, while a signal-killed delegate may
// have no exit code at all; retaining both lets telemetry distinguish those
// cancellation paths from ordinary failures without guessing from a number.
export function normalizeSpawnExit(
	code: number | null,
	signal: NodeJS.Signals | null,
	forwardedSignal?: NodeJS.Signals
): SpawnResult {
	const terminationSignal = signal ?? forwardedSignal ?? undefined;
	const exitCode =
		code ??
		(terminationSignal ? 128 + (constants.signals[terminationSignal] ?? 1) : 1);
	return {
		exitCode,
		...(terminationSignal ? { signal: terminationSignal } : {}),
	};
}

/**
 * Spawn the implementation and wait for it to exit.
 *
 * Returns the impl's exit code and, when known, the signal that ended it. The
 * signal is retained separately so callers do not need to infer cancellation
 * from platform-specific exit codes. A null exit code without a signal maps to
 * 1 so cf still exits non-zero.
 *
 * Argv is forwarded verbatim after the `dev` subcommand token.
 * Everything from the user's original `cf dev …` invocation flows
 * through here untouched, including unknown flags that yargs would
 * normally reject — see the `parserConfiguration` setup in `index.ts`
 * for how that's achieved.
 */
export async function spawnImpl(
	discovered: DiscoveredImpl,
	verb: string,
	argv: string[],
	options: SpawnOptions = {}
): Promise<SpawnResult> {
	const output = options.output ?? "stdout";
	const binary = discovered.binary;
	if (!binary) {
		// Caller (commands/dev/index.ts) checks this before calling, but
		// we keep the guard here so the function is safe to call without
		// re-deriving the precondition.
		throw new Error(
			`Cannot spawn ${discovered.impl.pkg}: binary not found.\n` +
				`Try: ${discovered.impl.installHint}`
		);
	}

	// PyPI impls under uv use a `uv:<pkg>` sentinel from the discoverer
	// to signal "invoke via `uv run` rather than the bare binary." Split
	// it out into the right argv shape for the subprocess.
	const { command, prefixArgs } = parseBinaryToken(binary);

	// tinyexec resolves delegate shebangs on Windows, including extensionless
	// entrypoints that native spawn cannot execute directly.
	const child = x(command, [...prefixArgs, verb, ...argv], {
		// Delegates should see the user's PATH without extra local binaries.
		nodePath: false,
		nodeOptions: {
			// Dev inherits stdout so the implementation owns the terminal. A
			// composed one-shot command may instead route build output to stderr
			// (preserving JSON stdout) or suppress non-error output under --quiet.
			stdio: [
				"inherit",
				output === "stderr"
					? process.stderr
					: output === "silent"
						? "ignore"
						: "inherit",
				"inherit",
			],
			// Pass cwd through implicitly via process.cwd(); the impl reads
			// its own config from there. The impl also needs the user's full
			// environment (PATH, NODE_OPTIONS, virtualenv markers, etc.), so
			// we don't whitelist. Dev servers are always pointed at cf's
			// resolved registry: existing Wrangler/Vite-based implementations
			// consume WRANGLER_REGISTRY_PATH, while cf-native implementations
			// consume CLOUDFLARE_REGISTRY_PATH. We also append
			// `--no-deprecation` to NODE_OPTIONS so transitive userland
			// `punycode` deprecation warnings don't leak into the impl's
			// terminal output. The impls themselves can't easily suppress
			// these (the warning fires before user code runs); the parent
			// is the right place to set the env flag. Other deprecation
			// warnings the user might actually want to see are sacrificed
			// here in exchange for clean dev-server output.
			env: implEnvironment(verb, options.env),
		},
	});

	// SIGINT / SIGTERM forwarding. Node delivers signals to cf; we
	// relay to the child and let the child decide whether to clean up
	// or exit. We do NOT also exit cf early — we wait on the child's
	// exit so cf's own exit code matches the impl's, per spec.
	let forwardedSignal: NodeJS.Signals | undefined;
	const forward = (sig: NodeJS.Signals) => {
		forwardedSignal ??= sig;
		// Windows broadcasts Ctrl+C to every process sharing the console.
		// child.kill("SIGINT") there would forcefully terminate the delegate
		// before its own Ctrl+C handler can finish graceful shutdown.
		if (!shouldRelaySignal(sig)) {
			return;
		}
		// Termination is best-effort if the child has already exited.
		child.kill(sig);
	};
	const onSigInt = () => forward("SIGINT");
	const onSigTerm = () => forward("SIGTERM");
	process.on("SIGINT", onSigInt);
	process.on("SIGTERM", onSigTerm);

	try {
		const result = await child;
		return normalizeSpawnExit(
			result.exitCode ?? null,
			child.process?.signalCode ?? null,
			forwardedSignal
		);
	} finally {
		process.off("SIGINT", onSigInt);
		process.off("SIGTERM", onSigTerm);
	}
}

function implEnvironment(
	verb: string,
	overrides: Readonly<NodeJS.ProcessEnv> = {}
): NodeJS.ProcessEnv {
	const env = {
		...appendNodeOption(process.env, "--no-deprecation"),
		...overrides,
		// Shared integrations use this marker to select cf's auth profile.
		CLOUDFLARE_CF_AUTH: "true",
	};
	if (verb !== "dev") {
		return env;
	}

	return {
		...env,
		...getCloudflareRegistryEnvironment(env),
	};
}

/**
 * Translate a discoverer-provided binary token into a spawnable
 * (command, prefixArgs) pair.
 *
 * Most impls return a plain absolute path (e.g.
 * `/path/to/node_modules/@cloudflare/vite-plugin/bin/cf-vite`) and we
 * pass it to tinyexec directly. PyPI impls under uv-managed projects return
 * `uv:<pkg>` (the discoverer's sentinel), which we expand to
 * `uv run --no-sync <pkg>` so the impl runs in the project's uv
 * environment without paying for a lock-resolution roundtrip.
 */
function parseBinaryToken(token: string): {
	command: string;
	prefixArgs: string[];
} {
	if (token.startsWith("uv:")) {
		const pkg = token.slice("uv:".length);
		return { command: "uv", prefixArgs: ["run", "--no-sync", pkg] };
	}
	return { command: token, prefixArgs: [] };
}

/**
 * Return a copy of `env` with `flag` appended to NODE_OPTIONS.
 *
 * NODE_OPTIONS is a space-separated list of Node CLI flags applied to
 * any Node process started with that env. We append rather than
 * replace so the user's existing settings (e.g. `--max-old-space-size`)
 * survive. Idempotent: if `flag` is already present, returns the env
 * unchanged.
 */
function appendNodeOption(
	env: NodeJS.ProcessEnv,
	flag: string
): NodeJS.ProcessEnv {
	const existing = env.NODE_OPTIONS ?? "";
	if (existing.split(/\s+/).includes(flag)) {
		return env;
	}
	return {
		...env,
		NODE_OPTIONS: existing ? `${existing} ${flag}` : flag,
	};
}
