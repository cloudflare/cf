import type { CommandTelemetryMeta } from "../lib/telemetry/run.js";

type CommandImporter = () => Promise<{ default: unknown }>;

export interface RootHandWrittenCommand {
	kind: "root";
	command: string;
	describe: string | false;
	dir: string;
	load: CommandImporter;
	telemetry: CommandTelemetryMeta | null;
}

export interface LeafOverrideHandWrittenCommand {
	kind: "leafOverride";
	emitKey: string;
	dir: string;
}

export interface LeafHandWrittenCommand {
	kind: "leaf";
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
}

export interface SubGroupHandWrittenCommand {
	kind: "subgroup";
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
		command: "auth",
		describe: "Manage authentication and profiles",
		dir: "auth",
		load: () => import("./auth/index.js"),
		telemetry: { command: "auth", recordArgs: false },
	},
	{
		kind: "root",
		command: "login",
		describe: false,
		dir: "login",
		load: () => import("./login/index.js"),
		telemetry: null,
	},
	{
		kind: "root",
		command: "build",
		describe: "Build a project for Cloudflare",
		dir: "build",
		load: () => import("./build/index.js"),
		telemetry: { command: "build", classification: { safeFlags: [] } },
	},
	{
		kind: "root",
		command: "complete [shell]",
		describe: "Generate and handle shell completions",
		dir: "completions",
		load: () => import("./completions/index.js"),
		telemetry: null,
	},
	{
		kind: "root",
		command: "deploy",
		describe: "Deploy a project to Cloudflare",
		dir: "deploy",
		load: () => import("./deploy/index.js"),
		telemetry: {
			command: "deploy",
			classification: {
				safeFlags: ["dry-run", "prebuilt", "containers-rollout"],
			},
		},
	},
	{
		kind: "root",
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
		command: "cli",
		describe: "Discover commands and configure the cf CLI",
		dir: "cli",
		load: () => import("./cli/index.js"),
		telemetry: { command: "cli", recordArgs: false },
	},
	{
		kind: "root",
		command: "previews",
		describe: "Manage Worker Previews",
		dir: "previews",
		load: () => import("./previews/index.js"),
		telemetry: { command: "previews", recordArgs: false },
	},
	{
		kind: "root",
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
		emitKey: "ai/run",
		dir: "ai/run",
	},
	{
		kind: "leafOverride",
		emitKey: "registrar/registrations/create",
		dir: "registrar/registrations/create",
	},
	{
		kind: "leaf",
		parent: "workers/versions",
		name: "create",
		dir: "workers/versions/create",
	},
	{
		kind: "leaf",
		parent: "containers",
		name: "build",
		dir: "containers/build",
	},
	{
		kind: "leaf",
		parent: "containers",
		name: "push",
		dir: "containers/push",
	},
	{
		kind: "leaf",
		parent: "containers/images",
		name: "list",
		dir: "containers/images/list",
	},
	{
		kind: "leaf",
		parent: "containers/images",
		name: "delete",
		dir: "containers/images/delete",
	},
	{
		kind: "leaf",
		parent: "containers",
		name: "ssh",
		dir: "containers/ssh",
	},
	{
		kind: "leaf",
		parent: "pages",
		name: "deploy",
		dir: "pages/deploy",
	},
	{
		kind: "leaf",
		parent: "workers",
		name: "check",
		dir: "workers/check",
	},
	{
		kind: "leaf",
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
		parent: "access",
		name: "login",
		dir: "access/login",
	},
	{
		kind: "leaf",
		parent: "access",
		name: "token",
		dir: "access/token",
	},
	{
		kind: "leaf",
		parent: "access",
		name: "ssh-config",
		dir: "access/ssh-config",
	},
	{
		kind: "leaf",
		parent: "access",
		name: "ssh-gen",
		dir: "access/ssh-gen",
	},
	{
		kind: "leaf",
		parent: "access",
		name: "tcp",
		dir: "access/tcp",
	},
	{
		kind: "leaf",
		parent: "access",
		name: "curl",
		dir: "access/curl",
	},
	{
		kind: "leaf",
		parent: "tunnels",
		name: "diag",
		dir: "tunnels/diag",
	},
	{
		kind: "leaf",
		parent: "tunnels",
		name: "login",
		dir: "tunnels/login",
	},
	{
		kind: "leaf",
		parent: "tunnels",
		name: "quick-start",
		dir: "tunnels/quick-start",
	},
	{
		kind: "leaf",
		parent: "tunnels",
		name: "ready",
		dir: "tunnels/ready",
	},
	{
		kind: "leaf",
		parent: "tunnels",
		name: "run",
		dir: "tunnels/run",
	},
	{
		kind: "leaf",
		parent: "tunnels",
		name: "tail",
		dir: "tunnels/tail",
	},
	{
		kind: "subgroup",
		parent: "d1",
		name: "migrations",
		dir: "d1/migrations",
		describe: "Create, list, and apply D1 database migrations",
	},
	{
		kind: "subgroup",
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
