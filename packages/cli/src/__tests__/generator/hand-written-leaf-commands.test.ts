import { describe, expect, it } from "vitest";
import {
	assertUniqueHandWrittenLeafCommandNames,
	generateGroupIndexFile,
	generateResourceIndexFile,
} from "../../../generator/emit/index-files.js";
import {
	handWrittenLeafCommandModule,
	handWrittenLeafCommands,
	handWrittenParentOverrides,
	readHandWrittenLeafCommandMeta,
} from "../../../generator/hand-written-overrides.js";
import { errorMessage } from "../../../generator/util.js";

const workersSchema = {
	name: "workers",
	description: "Workers",
} as Parameters<typeof generateResourceIndexFile>[0];

const accessSchema = {
	name: "access",
	description: "Access",
} as Parameters<typeof generateResourceIndexFile>[0];

describe("hand-written leaf commands", () => {
	it("registers a leaf command against its generated product", () => {
		expect(handWrittenLeafCommands("workers")).toEqual([
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
		]);
		expect(handWrittenLeafCommands("workers/versions")).toEqual([
			{
				kind: "leaf",
				dryRun: "native",
				parent: "workers/versions",
				name: "create",
				dir: "workers/versions/create",
			},
		]);
		expect(handWrittenLeafCommands("dns")).toEqual([]);
		expect(handWrittenLeafCommands("tunnels")).toEqual([
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
		]);
		expect(handWrittenLeafCommandModule("workers/check")).toBe(
			"#commands/workers/check/index.js"
		);
		expect(handWrittenLeafCommandModule("tunnels/diag")).toBe(
			"#commands/tunnels/diag/index.js"
		);
		expect(handWrittenLeafCommandModule("tunnels/quick-start")).toBe(
			"#commands/tunnels/quick-start/index.js"
		);
		expect(handWrittenLeafCommandModule("tunnels/login")).toBe(
			"#commands/tunnels/login/index.js"
		);
		expect(handWrittenLeafCommandModule("tunnels/ready")).toBe(
			"#commands/tunnels/ready/index.js"
		);
		expect(handWrittenLeafCommandModule("tunnels/run")).toBe(
			"#commands/tunnels/run/index.js"
		);
		expect(handWrittenLeafCommandModule("tunnels/tail")).toBe(
			"#commands/tunnels/tail/index.js"
		);
		expect(handWrittenLeafCommandModule("workers/versions/create")).toBe(
			"#commands/workers/versions/create/index.js"
		);
		expect(handWrittenLeafCommandModule("workers/types")).toBe(
			"#commands/workers/types/index.js"
		);
		expect(handWrittenLeafCommandModule("workers/scripts/check")).toBe(
			undefined
		);
	});

	it("adds process commands to the generated Access root", () => {
		expect(handWrittenLeafCommands("access")).toEqual([
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
		]);
		expect(handWrittenParentOverrides("access")).toEqual({
			describe: "Access protected applications and services",
			expose: true,
		});
		const tcp = handWrittenLeafCommands("access").find(
			(command) => command.name === "tcp"
		);
		if (tcp === undefined) {
			throw new Error("access tcp is not registered");
		}
		expect(readHandWrittenLeafCommandMeta("access", tcp).aliases).toEqual([
			"ssh",
			"rdp",
			"smb",
		]);

		const generated = generateResourceIndexFile(accessSchema, [], []);
		expect(generated).toContain(
			"describe: 'Access protected applications and services'"
		);
		expect(generated).toContain(
			"import $login from '#commands/access/login/index.js';"
		);
		expect(generated).toContain(
			"import $token from '#commands/access/token/index.js';"
		);
		expect(generated).toContain(
			"import $sshconfig from '#commands/access/ssh-config/index.js';"
		);
		expect(generated).toContain(
			"import $sshgen from '#commands/access/ssh-gen/index.js';"
		);
		expect(generated).toContain(
			"import $tcp from '#commands/access/tcp/index.js';"
		);
		expect(generated).toContain(
			"import $curl from '#commands/access/curl/index.js';"
		);
	});

	it("binds sidecar identity to the registered command", () => {
		const [registered] = handWrittenLeafCommands("workers");
		if (registered === undefined) {
			throw new Error("workers check is not registered");
		}
		const meta = readHandWrittenLeafCommandMeta("workers", registered);

		expect(meta).toMatchObject({
			command: "cf workers check",
			name: "check",
			fullPath: ["workers", "check"],
			category: "action",
		});
		expect(() => readHandWrittenLeafCommandMeta("dns", registered)).toThrow(
			"identity must match its registration"
		);
	});

	it("binds a nested sidecar identity to its registered command", () => {
		const [registered] = handWrittenLeafCommands("workers/versions");
		if (registered === undefined) {
			throw new Error("workers versions create is not registered");
		}
		const meta = readHandWrittenLeafCommandMeta("workers/versions", registered);

		expect(meta).toMatchObject({
			command: "cf workers versions create",
			name: "create",
			fullPath: ["workers", "versions", "create"],
			category: "create",
		});
		expect(() => readHandWrittenLeafCommandMeta("dns", registered)).toThrow(
			"identity must match its registration"
		);
	});

	it("splices the command into the generated resource index", () => {
		const generated = generateResourceIndexFile(
			workersSchema,
			["versions"],
			[]
		);

		expect(generated).toContain(
			"import $check from '#commands/workers/check/index.js';"
		);
		expect(generated).toContain(
			"import $types from '#commands/workers/types/index.js';"
		);
		expect(generated).toContain(
			".command(withHandWrittenDryRun($check, 'preview'))"
		);
		expect(generated).toContain(
			".command(withHandWrittenDryRun($types, 'preview'))"
		);
		expect(
			generated.indexOf(".command(withHandWrittenDryRun($check, 'preview'))")
		).toBeLessThan(generated.indexOf(".command($versions)"));
	});

	it("splices a nested leaf into its generated group index", () => {
		const generated = generateGroupIndexFile(
			{
				name: "versions",
				description: "Manage Worker versions",
				methods: [],
			},
			"workers",
			["delete", "get", "list"],
			undefined,
			"workers/versions/"
		);

		expect(generated).toContain(
			"import $create from '#commands/workers/versions/create/index.js';"
		);
		expect(generated).toContain(
			".command(withHandWrittenDryRun($create, 'native'))"
		);
		expect(
			generated.indexOf(".command(withHandWrittenDryRun($create, 'native'))")
		).toBeLessThan(generated.indexOf(".command($delete)"));
	});

	it("fails clearly if the spec adds a leaf command with the same name", () => {
		expect(() =>
			generateResourceIndexFile(workersSchema, ["check"], [])
		).toThrow(
			'Hand-written leaf command "workers check" collides with a command or group of the same name in the spec.'
		);
	});

	it("fails clearly if a generated group gains the nested leaf", () => {
		expect(() =>
			generateGroupIndexFile(
				{
					name: "versions",
					description: "Manage Worker versions",
					methods: [],
				},
				"workers",
				["create"],
				undefined,
				"workers/versions/"
			)
		).toThrow(
			'Hand-written leaf command "workers versions create" collides with a command or group of the same name in the spec.'
		);
	});

	it("fails clearly if the spec adds a group with the same name", () => {
		expect(() =>
			generateResourceIndexFile(
				workersSchema,
				[],
				[{ name: "check", commands: [] }]
			)
		).toThrow(
			'Hand-written leaf command "workers check" collides with a command or group of the same name in the spec.'
		);
	});

	it("fails clearly if a leaf command is registered more than once", () => {
		expect(() =>
			assertUniqueHandWrittenLeafCommandNames("workers", [
				{ name: "check", dir: "workers/check" },
				{ name: "check", dir: "workers/duplicate-check" },
			])
		).toThrow(
			'Hand-written leaf command "workers check" is registered more than once.'
		);
	});
});

describe("nested hand-written image leaves", () => {
	const group = { name: "images", description: "Images" } as Parameters<
		typeof generateGroupIndexFile
	>[0];
	it("adds list/delete alongside prepare and resolves nested imports", () => {
		const output = generateGroupIndexFile(
			group,
			"containers",
			["prepare"],
			[],
			"containers/images/"
		);
		expect(output).toContain("#commands/containers/images/list/index.js");
		expect(output).toContain("#commands/containers/images/delete/index.js");
		expect(output).toContain(".command($prepare)");
		expect(handWrittenLeafCommandModule("containers/images/list")).toBe(
			"#commands/containers/images/list/index.js"
		);
		for (const command of handWrittenLeafCommands("containers/images")) {
			expect(
				readHandWrittenLeafCommandMeta(command.parent, command).fullPath
			).toEqual(["containers", "images", command.name]);
		}
	});
	it("rejects future spec leaf and group collisions", () => {
		expect(() =>
			generateGroupIndexFile(
				group,
				"containers",
				["list"],
				[],
				"containers/images/"
			)
		).toThrow("collides");
		expect(() =>
			generateGroupIndexFile(
				group,
				"containers",
				[],
				[{ name: "delete" }],
				"containers/images/"
			)
		).toThrow("collides");
	});

	it("normalizes non-Error sidecar failures for aggregate reporting", () => {
		expect(errorMessage(new Error("invalid sidecar"))).toBe("invalid sidecar");
		expect(errorMessage("invalid sidecar")).toBe("invalid sidecar");
		expect(errorMessage(undefined)).toBe("undefined");
	});
});
