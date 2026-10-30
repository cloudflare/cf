// Kept import-free so the Forge plugin can share the runtime's flag definitions.
export const GLOBAL_OPTIONS = {
	quiet: {
		type: "boolean",
		alias: "q",
		description: "Suppress non-essential output",
		global: true,
		default: false,
	},
	zone: {
		type: "string",
		alias: "z",
		description: "Zone ID or domain name (overrides CLOUDFLARE_ZONE_ID)",
		global: true,
		// Passing --zone switches account-or-zone commands to zone scope, so a
		// missing value must fail here rather than leave a scope without an ID.
		coerce: (zone: unknown) => {
			if (Array.isArray(zone)) {
				throw new Error("--zone can only be specified once.");
			}
			if (typeof zone !== "string" || zone === "") {
				throw new Error("--zone requires a non-empty value.");
			}
			return zone;
		},
	},
	profile: {
		type: "string",
		description: "Use a specific auth profile",
		requiresArg: true,
		global: true,
	},
	mode: {
		type: "string",
		alias: "m",
		description: "Mode used to evaluate project configuration",
		requiresArg: true,
		global: true,
		coerce: (mode: string | string[]) => {
			if (Array.isArray(mode)) {
				throw new Error("--mode can only be specified once.");
			}
			if (mode === "") {
				throw new Error("--mode requires a non-empty value.");
			}
			return mode;
		},
	},
	"temporary-account": {
		type: "boolean",
		description:
			"Create or reuse a temporary account when no Cloudflare credentials are available",
		global: true,
		default: false,
		hidden: true,
	},
	// Errors never include the event code: it is a shared secret for an event.
	"event-code": {
		type: "string",
		description:
			"Specify the event code to use when creating a temporary account for an event",
		requiresArg: true,
		global: true,
		hidden: true,
		coerce: (eventCode: string | string[]) => {
			if (Array.isArray(eventCode)) {
				throw new Error("--event-code expects a single value.");
			}
			const trimmed = eventCode.trim();
			if (!trimmed) {
				throw new Error("--event-code cannot be empty.");
			}
			return trimmed;
		},
	},
	// `--local` runs the command against cf's on-disk Miniflare state
	// instead of the production API: cf spawns its own Miniflare over
	// `--persist-to` (default `~/.config/cloudflare/state/v3`), dispatches to the
	// local-explorer worker, and disposes it before exiting. No dev
	// session needs to be running. Endpoints the explorer doesn't
	// implement surface as a "no local equivalent" error.
	local: {
		type: "boolean",
		description: "Use local resource simulations",
		global: true,
		default: false,
	},
	"persist-to": {
		type: "string",
		description:
			"Directory holding local persisted state (default: ~/.config/cloudflare/state)",
		requiresArg: true,
		global: true,
	},
} as const;

export const BUILTIN_OPTIONS = {
	help: { alias: "h", description: "Show help" },
	version: { alias: "v", description: "Show version number" },
} as const;

/** Every global flag name and alias, including yargs's built-in flags. */
export const GLOBAL_OPTION_NAMES: readonly string[] = Object.entries<{
	readonly description: string;
	readonly alias?: string | readonly string[];
}>({ ...GLOBAL_OPTIONS, ...BUILTIN_OPTIONS }).flatMap(([name, { alias }]) => [
	name,
	...(alias === undefined ? [] : typeof alias === "string" ? [alias] : alias),
]);

/**
 * Names cf claims for cross-cutting flags it has not shipped yet, so no API
 * field takes one first:
 *
 * - `remote`: force production-API routing if local ever becomes the default.
 * - `cwd`: run as if from a different working directory, like Wrangler's.
 * - `config` / `c`: an explicit Cloudflare config-file path.
 * - `json`, `ndjson`, `pretty`: output-format toggles.
 *
 * Every `--experimental-*` name is reserved too, for opt-in feature gates.
 */
export const FUTURE_OPTION_NAMES: readonly string[] = [
	"remote",
	"cwd",
	"config",
	"c",
	"json",
	"ndjson",
	"pretty",
];

const EXPERIMENTAL_OPTION_PREFIX = "experimental-";

/** Why cf owns a flag name: everywhere, or only on one command. */
export type FlagOwner =
	| "global"
	| "future"
	| "experimental"
	| "single-letter"
	| "command";

/** Completes "`--name` ..." in messages that explain a clash. */
export const FLAG_OWNER_TEXT: { readonly [K in FlagOwner]: string } = {
	global: "is a global cf option",
	future: "is reserved for a future cf option",
	experimental: "is in cf's reserved --experimental-* namespace",
	"single-letter": "is a single-letter name cf reserves for aliases",
	command: "is a flag cf adds to this command",
};

const GLOBAL_FLAGS = new Set(GLOBAL_OPTION_NAMES.map(normalizeFlag));
const FUTURE_FLAGS = new Set(FUTURE_OPTION_NAMES);

/**
 * Who owns `flag` on a command that registers `commandFlags` itself, or
 * `undefined` when an API field may take it. Names compare kebab-normalized,
 * so `temporaryAccount` and `temporary_account` both match
 * `temporary-account`.
 */
export function flagOwnership(
	commandFlags: Iterable<string>
): (flag: string) => FlagOwner | undefined {
	const command = new Set(Array.from(commandFlags, normalizeFlag));
	return (flag) => {
		const name = normalizeFlag(flag);
		if (GLOBAL_FLAGS.has(name)) {
			return "global";
		}
		if (FUTURE_FLAGS.has(name)) {
			return "future";
		}
		if (name.startsWith(EXPERIMENTAL_OPTION_PREFIX)) {
			return "experimental";
		}
		if (/^[a-z]$/.test(name)) {
			return "single-letter";
		}
		return command.has(name) ? "command" : undefined;
	};
}

function normalizeFlag(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/[_.\s]+/g, "-")
		.toLowerCase();
}
