import type { HandWrittenDryRunStrategy } from "../lib/hand-written-dry-run.js";
import type { CommandTelemetryMeta } from "../lib/telemetry/run.js";

type CommandImporter = () => Promise<{ default: unknown }>;

export interface RootHandWrittenCommand {
	kind: "root";
	/** Every executable command must choose a {@link HandWrittenDryRunStrategy}. */
	dryRun: HandWrittenDryRunStrategy;
	command: string;
	describe: string | false;
	dir: string;
	load: CommandImporter;
	telemetry: CommandTelemetryMeta | null;
}

export interface LeafOverrideHandWrittenCommand {
	kind: "leafOverride";
	dryRun: "native";
	emitKey: string;
	dir: string;
}

export interface LeafHandWrittenCommand {
	kind: "leaf";
	dryRun: HandWrittenDryRunStrategy;
	/** Slash-separated parent path within the generated command tree. */
	parent: string;
	name: string;
	dir: string;
}

export interface ParentOverrideHandWrittenCommand {
	kind: "parentOverride";
	parent: string;
	describe: string;
	expose: boolean;
	/** Create the root for local leaves when OpenAPI does not provide it yet. */
	createIfMissing?: boolean;
}

export interface SubGroupHandWrittenCommand {
	kind: "subgroup";
	dryRun: HandWrittenDryRunStrategy;
	parent: string;
	name: string;
	dir: string;
	describe: string;
}

export type HandWrittenCommand =
	| RootHandWrittenCommand
	| LeafOverrideHandWrittenCommand
	| LeafHandWrittenCommand
	| ParentOverrideHandWrittenCommand
	| SubGroupHandWrittenCommand;

export const handWrittenCommands: readonly HandWrittenCommand[] = [
	{
		kind: "root",
		dryRun: "preview",
		command: "auth",
		describe: "Manage authentication and profiles",
		dir: "auth",
		load: () => import("./auth/index.js"),
		telemetry: { command: "auth", recordArgs: false },
	},
	{
		kind: "root",
		dryRun: "preview",
		command: "login",
		describe: false,
		dir: "login",
		load: () => import("./login/index.js"),
		telemetry: null,
	},
	{
		kind: "root",
		dryRun: "preview",
		command: "build",
		describe: "Build a project for Cloudflare",
		dir: "build",
		load: () => import("./build/index.js"),
		telemetry: { command: "build", classification: { safeFlags: [] } },
	},
	{
		kind: "root",
		dryRun: "preview",
		command: "complete [shell]",
		describe: "Generate and handle shell completions",
		dir: "completions",
		load: () => import("./completions/index.js"),
		telemetry: null,
	},
	{
		kind: "root",
		dryRun: "native",
		command: "deploy",
		describe: "Deploy a project to Cloudflare",
		dir: "deploy",
		load: () => import("./deploy/index.js"),
		telemetry: {
			command: "deploy",
			classification: {
				safeFlags: ["dry-run", "prebuilt", "containers-rollout", "provision"],
			},
		},
	},
	{
		kind: "root",
		dryRun: "preview",
		command: "dev [implArgs..]",
		describe: "Run the project's Cloudflare dev server",
		dir: "dev",
		load: () => import("./dev/index.js"),
		telemetry: {
			command: "dev",
			recordArgs: false,
		},
	},
	{
		kind: "root",
		dryRun: "preview",
		command: "init [directory]",
		describe: "Create a new Cloudflare project or set up an existing one",
		dir: "init",
		load: () => import("./init/index.js"),
		telemetry: {
			command: "init",
			classification: { safeFlags: ["install", "package-manager"] },
		},
	},
	{
		kind: "root",
		dryRun: "native",
		command: "migrate [path]",
		describe: "Migrate a Wrangler project to cf",
		dir: "migrate",
		load: () => import("./migrate/index.js"),
		telemetry: {
			command: "migrate",
			recordArgs: false,
		},
	},
	{
		kind: "root",
		dryRun: "preview",
		command: "cli",
		describe: "Discover commands and configure the cf CLI",
		dir: "cli",
		load: () => import("./cli/index.js"),
		telemetry: { command: "cli", recordArgs: false },
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "previews",
		name: "deploy",
		dir: "previews/deploy",
	},
	{
		kind: "parentOverride",
		parent: "previews",
		describe: "Manage Worker Previews",
		expose: true,
		createIfMissing: true,
	},
	{
		kind: "root",
		dryRun: "preview",
		command: "schema [command..]",
		describe: "Show API schema details for a command",
		dir: "schema",
		load: () => import("./schema.js"),
		telemetry: {
			command: "schema",
			classification: { safeFlags: ["list"] },
		},
	},
	{
		kind: "root",
		dryRun: "preview",
		command: "tools",
		describe: false,
		dir: "tools",
		load: () => import("./tools.js"),
		telemetry: {
			command: "tools",
			classification: { safeFlags: ["text"] },
		},
	},
	{
		kind: "leafOverride",
		dryRun: "native",
		emitKey: "ai/run",
		dir: "ai/run",
	},
	{
		kind: "leafOverride",
		dryRun: "native",
		emitKey: "registrar/registrations/create",
		dir: "registrar/registrations/create",
	},
	{
		kind: "leaf",
		dryRun: "native",
		parent: "workers/versions",
		name: "create",
		dir: "workers/versions/create",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "containers",
		name: "build",
		dir: "containers/build",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "containers",
		name: "push",
		dir: "containers/push",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "containers/images",
		name: "list",
		dir: "containers/images/list",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "containers/images",
		name: "delete",
		dir: "containers/images/delete",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "containers",
		name: "ssh",
		dir: "containers/ssh",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "pages",
		name: "deploy",
		dir: "pages/deploy",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "workers",
		name: "check",
		dir: "workers/check",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "workers",
		name: "types",
		dir: "workers/types",
	},
	{
		kind: "parentOverride",
		parent: "access",
		describe: "Access protected applications and services",
		expose: true,
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "access",
		name: "login",
		dir: "access/login",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "access",
		name: "token",
		dir: "access/token",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "access",
		name: "ssh-config",
		dir: "access/ssh-config",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "access",
		name: "ssh-gen",
		dir: "access/ssh-gen",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "access",
		name: "tcp",
		dir: "access/tcp",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "access",
		name: "curl",
		dir: "access/curl",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "tunnels",
		name: "diag",
		dir: "tunnels/diag",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "tunnels",
		name: "login",
		dir: "tunnels/login",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "tunnels",
		name: "quick-start",
		dir: "tunnels/quick-start",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "tunnels",
		name: "ready",
		dir: "tunnels/ready",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "tunnels",
		name: "run",
		dir: "tunnels/run",
	},
	{
		kind: "leaf",
		dryRun: "preview",
		parent: "tunnels",
		name: "tail",
		dir: "tunnels/tail",
	},
	{
		kind: "subgroup",
		dryRun: "preview",
		parent: "d1",
		name: "migrations",
		dir: "d1/migrations",
		describe: "Create, list, and apply D1 database migrations",
	},
	{
		kind: "subgroup",
		dryRun: "native",
		parent: "workers",
		name: "triggers",
		dir: "workers/triggers",
		describe: "Manage triggers (Routes, Workflows, Cron triggers etc.)",
	},
];

export function rootHandWrittenCommands(): readonly RootHandWrittenCommand[] {
	return handWrittenCommands.filter(
		(command): command is RootHandWrittenCommand => command.kind === "root"
	);
}

export function leafOverrideHandWrittenCommands(): readonly LeafOverrideHandWrittenCommand[] {
	return handWrittenCommands.filter(
		(command): command is LeafOverrideHandWrittenCommand =>
			command.kind === "leafOverride"
	);
}

export function leafHandWrittenCommands(): readonly LeafHandWrittenCommand[] {
	return handWrittenCommands.filter(
		(command): command is LeafHandWrittenCommand => command.kind === "leaf"
	);
}

export function parentOverrideHandWrittenCommands(): readonly ParentOverrideHandWrittenCommand[] {
	return handWrittenCommands.filter(
		(command): command is ParentOverrideHandWrittenCommand =>
			command.kind === "parentOverride"
	);
}

export function subGroupHandWrittenCommands(): readonly SubGroupHandWrittenCommand[] {
	return handWrittenCommands.filter(
		(command): command is SubGroupHandWrittenCommand =>
			command.kind === "subgroup"
	);
}

export function rootCommandName(command: RootHandWrittenCommand): string {
	return command.command.split(/\s+/)[0] ?? command.command;
}
