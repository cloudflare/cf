import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { rootHandWrittenCommands } from "../../commands/hand-written.js";
import type { CommandMeta } from "@cloudflare/forge";

type HandWrittenCommandMeta = CommandMeta & {
	handWritten: {
		kind: "root" | "leafOverride" | "leaf" | "subgroup";
		overrides: boolean;
		dir: string;
		emitKey?: string;
		parent?: string;
	};
};

function readJson<T>(relative: string): T {
	return JSON.parse(readFileSync(join(__dirname, relative), "utf-8")) as T;
}

describe("hand-written command metadata", () => {
	const metadata = readJson<{
		commands: CommandMeta[];
		descriptions?: Record<string, string>;
	}>("../../commands/_generated/_meta/commands.json");

	const commands = new Map(
		metadata.commands.map((command) => [command.command, command])
	);

	it("includes root hand-written commands in commands.json", () => {
		expect([...commands.keys()]).toEqual(
			expect.arrayContaining([
				"cf auth activate",
				"cf auth create",
				"cf auth deactivate",
				"cf auth delete",
				"cf auth list",
				"cf auth login",
				"cf auth logout",
				"cf auth whoami",
				"cf build",
				"cf cli search",
				"cf cli telemetry disable",
				"cf cli telemetry enable",
				"cf cli telemetry status",
				"cf complete",
				"cf deploy",
				"cf dev",
				"cf init",
				"cf init workers",
				"cf migrate",
				"cf previews deploy",
				"cf schema",
				"cf tools",
			])
		);
	});

	it("keeps root hand-written commands free of API identity fields", () => {
		for (const commandName of [
			"cf auth login",
			"cf deploy",
			"cf dev",
			"cf schema",
			"cf tools",
		]) {
			const command = commands.get(commandName);
			expect(command).toBeDefined();
			expect(command).not.toHaveProperty("httpMethod");
			expect(command).not.toHaveProperty("apiPath");
			expect(command).not.toHaveProperty("operationId");
			expect(command).not.toHaveProperty("hasRequestBody");
		}
	});

	it("preserves hidden metadata for hidden root commands", () => {
		expect(commands.get("cf tools")?.hideCommand).toBe(true);
		expect(commands.get("cf cli telemetry status")?.hideCommand).not.toBe(true);
	});

	it("keeps the cf login compatibility alias out of command metadata", () => {
		expect(
			metadata.commands.some((command) => command.fullPath[0] === "login")
		).toBe(false);
	});

	it("includes descriptions for root hand-written command groups", () => {
		expect(metadata.descriptions?.auth).toBe(
			"Manage authentication and profiles"
		);
		expect(metadata.descriptions?.cli).toBe(
			"Discover commands and configure the cf CLI"
		);
	});

	it("exposes generated leaves when a hand-written command exposes the parent", () => {
		expect(metadata.descriptions?.access).toBe(
			"Access protected applications and services"
		);
		for (const command of commands.values()) {
			if (command.command.startsWith("cf access ")) {
				expect(command.hideCommand).not.toBe(true);
			}
		}
	});

	it("classifies deploy control flags as telemetry-safe", () => {
		const deploy = rootHandWrittenCommands().find(
			(command) => command.command === "deploy"
		);

		expect(deploy?.telemetry).toMatchObject({
			classification: {
				safeFlags: expect.arrayContaining(["containers-rollout", "provision"]),
			},
		});
	});

	it("publishes Preview prebuilt metadata", () => {
		expect(commands.get("cf previews deploy")?.options).toContainEqual({
			name: "prebuilt",
			type: "boolean",
			required: false,
			description:
				"Use existing Preview Build Output Specification files without building",
			default: false,
		});
	});

	it("does not publish global mode as a command-local option", () => {
		for (const command of commands.values()) {
			expect(command.options?.some((option) => option.name === "mode")).toBe(
				false
			);
		}
	});
});

describe("hand-written-only command metadata", () => {
	const allMetadata = readJson<{
		commands: CommandMeta[];
	}>("../../commands/_generated/_meta/commands.json");
	const metadata = readJson<{
		commands: HandWrittenCommandMeta[];
		descriptions?: Record<string, string>;
	}>("../../commands/_generated/_meta/hand-written-commands.json");

	const allCommands = new Map(
		allMetadata.commands.map((command) => [command.command, command])
	);
	const commands = new Map(
		metadata.commands.map((command) => [command.command, command])
	);

	it("contains only hand-written commands", () => {
		expect(commands.size).toBe(49);
		expect(commands.has("cf pages deploy")).toBe(true);
		expect(commands.has("cf tunnels diag")).toBe(true);
		expect(commands.has("cf tunnels login")).toBe(true);
		expect(commands.has("cf tunnels ready")).toBe(true);
		expect(commands.has("cf tunnels tail")).toBe(true);
		expect(commands.has("cf access login")).toBe(true);
		expect(commands.has("cf access token")).toBe(true);
		expect(commands.has("cf access ssh-config")).toBe(true);
		expect(commands.has("cf access ssh-gen")).toBe(true);
		expect(commands.has("cf access tcp")).toBe(true);
		expect(commands.has("cf access curl")).toBe(true);
		expect([...commands.keys()]).toEqual(
			expect.arrayContaining([
				"cf auth login",
				"cf cli search",
				"cf cli telemetry disable",
				"cf cli telemetry enable",
				"cf cli telemetry status",
				"cf containers build",
				"cf containers images delete",
				"cf containers images list",
				"cf containers push",
				"cf deploy",
				"cf init",
				"cf init workers",
				"cf migrate",
				"cf d1 migrations create",
				"cf workers triggers deploy",
				"cf workers versions create",
				"cf workers check",
				"cf workers types",
				"cf ai run",
				"cf registrar registrations create",
			])
		);
		expect(commands.has("cf dns records create")).toBe(false);
	});

	it("marks the CLI telemetry path as hand-written", () => {
		expect(commands.get("cf cli telemetry status")?.handWritten).toEqual({
			kind: "root",
			overrides: false,
			dir: "cli",
		});
		expect(commands.has("cf telemetry status")).toBe(false);
	});

	it("matches commands.json metadata with only hand-written markers added", () => {
		for (const command of metadata.commands) {
			const allCommandMeta = allCommands.get(command.command);
			expect(allCommandMeta).toBeDefined();
			const { handWritten: _handWritten, ...stripped } = command;
			expect(stripped).toEqual(allCommandMeta);
		}
	});

	it("includes deploy Container rollout metadata", () => {
		expect(commands.get("cf deploy")?.options).toContainEqual({
			name: "containers-rollout",
			type: "string",
			required: false,
			description:
				"Rollout strategy for Container changes. Immediate rolls out to all instances in one step; none leaves deployed Containers unchanged.",
			enum: ["immediate", "gradual", "none"],
		});
	});

	it("includes deploy provisioning metadata", () => {
		expect(commands.get("cf deploy")?.options).toContainEqual({
			name: "provision",
			type: "boolean",
			required: false,
			description:
				"Automatically provision resources for bindings that need them",
			default: true,
		});
	});

	it("marks leaf overrides as generated command overrides", () => {
		expect(commands.get("cf ai run")?.handWritten).toEqual({
			kind: "leafOverride",
			overrides: true,
			dir: "ai/run",
			emitKey: "ai/run",
		});
	});

	it("preserves spec-derived API identity for leaf overrides", () => {
		expect(commands.get("cf ai run")?.operationId).toBe(
			"workers-ai-post-run-generic"
		);
		expect(commands.get("cf registrar registrations create")?.operationId).toBe(
			"registrar-domain-registration-create"
		);
	});

	it("marks root, leaf, and subgroup commands without override status", () => {
		expect(commands.get("cf auth login")?.handWritten).toEqual({
			kind: "root",
			overrides: false,
			dir: "auth",
		});
		expect(commands.get("cf previews deploy")?.handWritten).toEqual({
			kind: "leaf",
			overrides: false,
			dir: "previews/deploy",
			parent: "previews",
		});
		expect(commands.get("cf d1 migrations create")?.handWritten).toEqual({
			kind: "subgroup",
			overrides: false,
			dir: "d1/migrations",
			parent: "d1",
		});
		expect(commands.get("cf workers check")?.handWritten).toEqual({
			kind: "leaf",
			overrides: false,
			dir: "workers/check",
			parent: "workers",
		});
		expect(commands.get("cf workers versions create")?.handWritten).toEqual({
			kind: "leaf",
			overrides: false,
			dir: "workers/versions/create",
			parent: "workers/versions",
		});
		expect(commands.get("cf tunnels quick-start")?.handWritten).toEqual({
			kind: "leaf",
			overrides: false,
			dir: "tunnels/quick-start",
			parent: "tunnels",
		});
		expect(commands.get("cf tunnels login")?.handWritten).toEqual({
			kind: "leaf",
			overrides: false,
			dir: "tunnels/login",
			parent: "tunnels",
		});
		expect(commands.get("cf tunnels run")?.handWritten).toEqual({
			kind: "leaf",
			overrides: false,
			dir: "tunnels/run",
			parent: "tunnels",
		});
		expect(commands.get("cf workers types")?.handWritten).toEqual({
			kind: "leaf",
			overrides: false,
			dir: "workers/types",
			parent: "workers",
		});
	});

	it("keeps non-API hand-written commands free of API identity fields", () => {
		for (const commandName of [
			"cf migrate",
			"cf workers check",
			"cf workers types",
			"cf workers versions create",
			"cf tunnels login",
			"cf tunnels quick-start",
			"cf tunnels run",
		]) {
			const command = commands.get(commandName);
			expect(command).not.toHaveProperty("httpMethod");
			expect(command).not.toHaveProperty("apiPath");
			expect(command).not.toHaveProperty("operationId");
			expect(command).not.toHaveProperty("hasRequestBody");
		}
	});

	it("describes the quick tunnel interface", () => {
		const quickStart = commands.get("cf tunnels quick-start");

		expect(quickStart?.arguments).toEqual([
			{
				name: "url",
				position: 0,
				type: "string",
				required: true,
				description: expect.any(String),
			},
		]);
		expect(quickStart?.options).toContainEqual({
			name: "log-level",
			type: "string",
			required: false,
			default: "info",
			description: "cloudflared log level",
			enum: [
				"trace",
				"debug",
				"info",
				"warn",
				"error",
				"fatal",
				"panic",
				"disabled",
			],
		});
	});
});
