import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { describe, expect, it, vi } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import {
	compactBody,
	parseBody,
	setNestedValue,
} from "../../../lib/body-parser.js";
import { resolveFileToken } from "../../../lib/input-validation.js";
import { generateFiles } from "../../helpers/cli-plugin.js";

const network = {
	type: "object",
	required: ["tunnel_id"],
	properties: { tunnel_id: { type: "string" } },
};
const host = {
	oneOf: [
		...[["ipv4"], ["ipv6"], ["ipv4", "ipv6"]].map((addresses) => ({
			type: "object",
			required: [...addresses, "network"],
			properties: {
				...Object.fromEntries(
					addresses.map((name) => [name, { type: "string" }])
				),
				network: { $ref: "#/components/schemas/Network" },
			},
		})),
		{
			type: "object",
			required: ["hostname", "resolver_network"],
			properties: {
				hostname: { type: "string" },
				resolver_network: {
					allOf: [
						{ $ref: "#/components/schemas/Network" },
						{
							type: "object",
							properties: {
								resolver_ips: { type: "array", items: { type: "string" } },
							},
						},
					],
				},
			},
		},
	],
};

function generate(rootUnion: boolean) {
	const common = {
		type: "object",
		required: ["name", "host"],
		properties: {
			name: { type: "string" },
			host,
			settings: {
				type: "object",
				required: ["key"],
				properties: { key: { type: "string" }, label: { type: "string" } },
			},
		},
	};
	const schema = rootUnion
		? {
				oneOf: ["tcp", "http"].map((type) => ({
					allOf: [
						common,
						{
							type: "object",
							required: ["type"],
							properties: { type: { type: "string", enum: [type] } },
						},
					],
				})),
			}
		: common;
	const files = generateFiles({
		openapi: "3.0.3",
		info: { title: "Union body flags", version: "1" },
		components: { schemas: { Network: network } },
		paths: {
			"/things": {
				post: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "create",
					summary: "Create a thing",
					requestBody: {
						required: true,
						content: { "application/json": { schema } },
					},
					responses: {
						"200": {
							description: "OK",
							content: { "application/json": { schema: { type: "object" } } },
						},
					},
				},
			},
		},
	});
	return files.get("things/create.ts") ?? "";
}

describe.each([false, true])(
	"oneOf body flags (root union: %s)",
	(rootUnion) => {
		const source = stripTypeScriptTypes(generate(rootUnion))
			.replace(/^import[\s\S]*?;\n/gm, "")
			.replace("export default command;", "command;");
		const setup = () => {
			const requestBody = vi.fn();
			const formatDryRun = vi.fn();
			const command = new Script(source).runInNewContext({
				compactBody,
				parseBody,
				setNestedValue,
				resolveFileToken,
				formatDryRun,
				createCommandClient: async () => ({
					send: async (_operation: unknown, request: { body: unknown }) =>
						requestBody(request.body),
				}),
				requestApi: async (
					_client: unknown,
					_method: string,
					_path: string,
					request: { body: unknown }
				) => requestBody(request.body),
				operation: {},
				formatOutput: () => {},
				withProgress: async (_label: string, run: () => Promise<unknown>) =>
					run(),
				runWithTelemetry: (
					_info: unknown,
					_argv: unknown,
					run: () => Promise<void>
				) => run(),
			}) as CommandModule;
			const parse = async (flags: string[]) =>
				yargs([
					"create",
					"--name",
					"example-db",
					...(rootUnion ? ["--type", "tcp"] : []),
					...flags,
				])
					.exitProcess(false)
					.command(command)
					.strict()
					.fail((message, error) => {
						throw error ?? new Error(message);
					})
					.parseAsync();
			return { parse, requestBody, formatDryRun };
		};

		const hosts = [
			{
				hostname: "db.example.internal",
				resolver_network: { tunnel_id: "resolver-tunnel" },
			},
			{ ipv4: "192.0.2.1", network: { tunnel_id: "ip-tunnel" } },
			{ ipv6: "2001:db8::1", network: { tunnel_id: "ip-tunnel" } },
			{
				ipv4: "192.0.2.1",
				ipv6: "2001:db8::1",
				network: { tunnel_id: "ip-tunnel" },
			},
		];
		const flags = [
			[
				"--host-hostname",
				"db.example.internal",
				"--host-resolver-network-tunnel-id",
				"resolver-tunnel",
			],
			["--host-ipv4", "192.0.2.1", "--host-network-tunnel-id", "ip-tunnel"],
			["--host-ipv6", "2001:db8::1", "--host-network-tunnel-id", "ip-tunnel"],
			[
				"--host-ipv4",
				"192.0.2.1",
				"--host-ipv6",
				"2001:db8::1",
				"--host-network-tunnel-id",
				"ip-tunnel",
			],
		];

		it.each([false, true])(
			"accepts all four alternatives (dry run: %s)",
			async (dryRun) => {
				for (const [index, expectedHost] of hosts.entries()) {
					const expected = {
						name: "example-db",
						host: expectedHost,
						...(rootUnion ? { type: "tcp" } : {}),
					};
					for (const input of [
						flags[index] ?? [],
						["--body", JSON.stringify(expected)],
					]) {
						const { parse, requestBody, formatDryRun } = setup();
						await parse([...input, ...(dryRun ? ["--dry-run"] : [])]);
						if (dryRun) {
							expect(formatDryRun).toHaveBeenCalledWith(
								expect.objectContaining({ body: expected })
							);
							expect(requestBody).not.toHaveBeenCalled();
						} else {
							expect(requestBody).toHaveBeenCalledWith(expected);
						}
					}
				}
			}
		);

		it.each([
			["--host-hostname", "db.example.internal"],
			["--host-ipv4", "192.0.2.1"],
			["--host-ipv6", "2001:db8::1"],
			["--host-resolver-network-resolver-ips", "192.0.2.53"],
			["--host-resolver-network-tunnel-id", "resolver-tunnel"],
			[...(flags[0] ?? []), "--host-network-tunnel-id", "ip-tunnel"],
			[...(flags[1] ?? []), "--host-hostname", "db.example.internal"],
		])(
			"rejects incomplete or incompatible alternatives: %j",
			async (...input) => {
				const { parse, requestBody } = setup();
				await expect(parse(input)).rejects.toThrow(
					/Implications failed|mutually exclusive/
				);
				expect(requestBody).not.toHaveBeenCalled();
			}
		);

		it("requires children only when their optional container is used", async () => {
			const { parse, requestBody } = setup();
			await expect(
				parse([...(flags[0] ?? []), "--settings-label", "label"])
			).rejects.toThrow("settings-key");
			expect(requestBody).not.toHaveBeenCalled();
			await parse([
				...(flags[0] ?? []),
				"--settings-label",
				"label",
				"--settings-key",
				"key",
			]);
			expect(requestBody).toHaveBeenCalledWith(
				expect.objectContaining({
					settings: { key: "key", label: "label" },
				})
			);
		});

		it("accepts optional fields inside the hostname alternative", async () => {
			const { parse, requestBody } = setup();
			await parse([
				...(flags[0] ?? []),
				"--host-resolver-network-resolver-ips",
				"192.0.2.53",
			]);
			expect(requestBody).toHaveBeenCalledWith(
				expect.objectContaining({
					host: {
						hostname: "db.example.internal",
						resolver_network: {
							tunnel_id: "resolver-tunnel",
							resolver_ips: ["192.0.2.53"],
						},
					},
				})
			);
		});
	}
);
