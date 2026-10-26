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
