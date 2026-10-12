/**
 * What each hand-written root command in `hand-written.ts` needs at run
 * time: the module it lazily loads, and how it reports telemetry. They live
 * apart from the registry because the generator plugin bundles the
 * registry, and must not follow these imports.
 */
import {
	rootHandWrittenCommands,
	type RootCommandDir,
	type RootHandWrittenCommand,
} from "./hand-written.js";
import type { CommandTelemetryMeta } from "../lib/telemetry/run.js";

interface RootCommandRuntime {
	load: () => Promise<{ default: unknown }>;
	telemetry: CommandTelemetryMeta | null;
}

export type LoadableRootCommand = RootHandWrittenCommand & RootCommandRuntime;

const runtime = {
	auth: {
		load: () => import("./auth/index.js"),
		telemetry: { command: "auth", recordArgs: false },
	},
	login: {
		load: () => import("./login/index.js"),
		telemetry: null,
	},
	build: {
		load: () => import("./build/index.js"),
		telemetry: { command: "build", classification: { safeFlags: [] } },
	},
	completions: {
		load: () => import("./completions/index.js"),
		telemetry: null,
	},
	deploy: {
		load: () => import("./deploy/index.js"),
		telemetry: {
			command: "deploy",
			classification: {
				safeFlags: ["dry-run", "prebuilt", "containers-rollout", "provision"],
			},
		},
	},
	dev: {
		load: () => import("./dev/index.js"),
		telemetry: { command: "dev", recordArgs: false },
	},
	init: {
		load: () => import("./init/index.js"),
		telemetry: {
			command: "init",
			classification: { safeFlags: ["install", "package-manager"] },
		},
	},
	migrate: {
		load: () => import("./migrate/index.js"),
		telemetry: { command: "migrate", recordArgs: false },
	},
	docs: {
		load: () => import("./docs/index.js"),
		telemetry: { command: "docs", recordArgs: false },
	},
	cli: {
		load: () => import("./cli/index.js"),
		telemetry: { command: "cli", recordArgs: false },
	},
	schema: {
		load: () => import("./schema.js"),
		telemetry: { command: "schema", classification: { safeFlags: ["list"] } },
	},
	tools: {
		load: () => import("./tools.js"),
		telemetry: { command: "tools", classification: { safeFlags: ["text"] } },
	},
} satisfies Record<RootCommandDir, RootCommandRuntime>;

/** The registry's root commands, with what they need at run time. */
export function loadableRootCommands(): LoadableRootCommand[] {
	return rootHandWrittenCommands().map((command) => ({
		...command,
		...runtime[command.dir],
	}));
}
