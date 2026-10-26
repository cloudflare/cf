/**
 * The commands the plugin derives from forge's model of a document: names,
 * operation IDs, flags, and how a typed call sends each operation.
 */
import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";

type Json = Record<string, unknown>;

/** A document with `paths`, and the schemas `schemas`. */
function doc(paths: Json, schemas: Json = {}) {
	return {
		openapi: "3.0.3",
		info: { title: "t", version: "1" },
		paths,
		components: { schemas },
	};
}

/** A JSON `200` response. */
const ok = () => ({
	"200": {
		description: "OK",
		content: { "application/json": { schema: { type: "object" } } },
	},
});

/** The account path parameter. */
const account = () => ({
	name: "account_id",
	in: "path",
	required: true,
	schema: { type: "string" },
});

/** The content of the file at `path` among the generated files of `d`. */
function file(d: ReturnType<typeof doc>, path: string) {
	const files = generateFiles(d);
	const content = files.get(path);
	if (content === undefined) {
		throw new Error(`no ${path} in ${[...files.keys()].join(", ")}`);
	}
	return content;
}

/**
 * The text of the `Operation` the module at `path`, under `_operations/`,
 * exports by default, among `files`.
 */
function operation(files: Map<string, string>, path: string): string {
	const module = files.get(`_operations/${path}.ts`) ?? "";
	const found = module.match(/export default (\{[\s\S]*?\n\}) as const;/);
	if (!found) {
		throw new Error(`no operation in _operations/${path}.ts:\n${module}`);
	}
	return found[1] ?? "";
}

interface CommandsFile {
	commands: Json[];
	descriptions: Record<string, string>;
}

/** The metadata of the command `command`. */
function meta(d: ReturnType<typeof doc>, command: string): Json {
	const commands = (JSON.parse(file(d, "_meta/commands.json")) as CommandsFile)
		.commands;
	const found = commands.find((c) => c["command"] === command);
	if (!found) {
		throw new Error(`no ${command}`);
	}
	return found;
}

/** A POST of `things.create` with the body schema `schema`. */
function create(schema: Json, schemas: Json = {}, required = true) {
	return doc(
		{
			"/accounts/{account_id}/things": {
				post: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "create",
					summary: "Create a thing",
					parameters: [account()],
					requestBody: {
						required,
						content: { "application/json": { schema } },
					},
					responses: ok(),
				},
			},
		},
		schemas
	);
}

/** The list method `things.list` with the query parameter `status` of type `schema`. */
function listing(schema: Json) {
	return doc({
		"/accounts/{account_id}/things": {
			get: {
				"x-fern-sdk-group-name": "things",
				"x-fern-sdk-method-name": "list",
				summary: "List things",
				parameters: [account(), { name: "status", in: "query", schema }],
				responses: ok(),
			},
		},
	});
}

describe("the forge model", () => {
	it("keeps UUID body fields and referenced UUID arrays as string flags", () => {
		const files = generateFiles(
			create(
				{
					type: "object",
					required: ["id"],
					properties: {
						id: { type: "string", format: "uuid" },
						parent_id: { type: "string", format: "uuid", nullable: true },
						dataset_ids: {
							type: "array",
							minItems: 1,
							maxItems: 50,
							items: { $ref: "#/components/schemas/ID" },
						},
					},
				},
				{ ID: { type: "string", format: "uuid" } }
			)
		);
		const code = files.get("things/create.ts") ?? "";
		expect(code).toContain('.option(\'id\', {"type":"string"');
		expect(code).toContain('.option(\'parent-id\', {"type":"string"');
		expect(code).toContain(
			'.option(\'dataset-ids\', {"type":"string","array":true'
		);
		expect(code).toContain("promptForRequiredField('id'");
		expect(code).toContain('id: resolveFileToken(argv["id"]');
		expect(code).toContain('parent_id: resolveFileToken(argv["parent-id"]');
		expect(code).toContain('dataset_ids: argv["dataset-ids"]');
		const metadata = JSON.parse(files.get("_meta/commands.json") ?? "{}");
		expect(metadata.commands[0].options).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "id", type: "string", required: true }),
				expect.objectContaining({ name: "parent-id", type: "string" }),
				expect.objectContaining({ name: "dataset-ids", type: "string" }),
			])
		);
	});

	it.each([
		{ type: "string", format: "uuid" },
		{ type: "string", format: "uuid", nullable: true },
		{
			anyOf: [
				{ type: "string", format: "uuid" },
				{ type: "array", items: { type: "string", format: "uuid" } },
			],
		},
	])("keeps UUID query parameters as strings: %j", (schema) => {
		const files = generateFiles(listing(schema));
		const schemas = JSON.parse(files.get("_meta/schemas.json") ?? "{}");
		expect(schemas.schemas["things list"].queryParams[0].type).toBe("string");
		expect(files.get("things/list.ts")).toContain(
			'.option(\'status\', {"type":"string"'
		);
	});

	it("retains required and optional scalar intersections and their enum constraints", () => {
		const d = create(
			{
				type: "object",
				required: ["vendor"],
				properties: {
					vendor: {
						type: "string",
						allOf: [
							{ $ref: "#/components/schemas/Vendor" },
							{ type: "string", description: "Asset vendor." },
						],
					},
					severity: {
						allOf: [
							{ $ref: "#/components/schemas/Severity" },
							{ type: "string", enum: ["High", "Low"] },
						],
					},
				},
			},
			{
				Vendor: { type: "string", enum: ["GITHUB", "SLACK"] },
				Severity: {
					type: "string",
					enum: ["Critical", "High", "Medium", "Low"],
				},
			}
		);
		const files = generateFiles(d);
		const code = files.get("things/create.ts") ?? "";
		expect(code).toContain(".option('vendor'");
		expect(code).toContain('"choices":["GITHUB","SLACK"]');
		expect(code).toContain('"choices":["High","Low"]');
		expect(code).toContain("promptForRequiredEnumField('vendor'");
		expect(code).not.toContain("promptForRequiredEnumField('severity'");
		expect(code).toContain('vendor: argv["vendor"]');
		expect(code).toContain('severity: argv["severity"]');
		const metadata = JSON.parse(files.get("_meta/commands.json") ?? "{}");
		expect(metadata.commands[0].options).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: "vendor",
					required: true,
					enum: ["GITHUB", "SLACK"],
				}),
				expect.objectContaining({
					name: "severity",
					required: false,
					enum: ["High", "Low"],
				}),
			])
		);
	});

	it("keeps same-kind scalar unions as enum flags", () => {
		const files = generateFiles(
			create({
				type: "object",
				properties: {
					selection: {
						oneOf: [
							{ type: "string", enum: ["first"] },
							{ type: "string", enum: ["second"] },
						],
					},
				},
			})
		);
		const code = files.get("things/create.ts") ?? "";
		expect(code).toContain('"choices":["first","second"]');
		expect(code).toContain('selection: argv["selection"]');
		expect(code).not.toContain("parseScalarValue");
	});

	it.each(["oneOf", "anyOf"])(
		"emits referenced scalar %s properties as typed scalar flags",
		(union) => {
			const files = generateFiles(
				create(
					{
						type: "object",
						properties: { fallback: { $ref: "#/components/schemas/Fallback" } },
					},
					{
						Fallback: {
							[union]: [{ type: "number" }, { type: "string", enum: ["veto"] }],
						},
					}
				)
			);
			const code = files.get("things/create.ts") ?? "";
			expect(code).toContain(".option('fallback'");
			expect(code).toContain("parseScalarValue");
			expect(code).toContain(
				'fallback: parseScalarValue(argv["fallback"], "fallback")'
			);
			expect(code).not.toContain('"choices":["veto"]');
			const metadata = JSON.parse(files.get("_meta/commands.json") ?? "{}");
			expect(metadata.commands[0].options).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: "fallback",
						type: "string",
						required: false,
					}),
				])
			);
		}
	);

	it("names commands in kebab-case, and joins the names into ids", () => {
		const d = doc({
			"/accounts/{account_id}/billing/setup": {
				post: {
					"x-fern-sdk-group-name": ["accounts", "billingProfiles"],
					"x-fern-sdk-method-name": "createSetupIntent",
					summary: "Create",
					parameters: [account()],
					responses: ok(),
				},
			},
		});
		const m = meta(d, "cf accounts billing-profiles create-setup-intent");
		expect(m["operationId"]).toBe(
			"accounts.billing-profiles.create-setup-intent"
		);
		expect(m["fullPath"]).toEqual([
			"accounts",
			"billing-profiles",
			"create-setup-intent",
		]);
		const index = file(d, "accounts/billing-profiles/index.ts");
		expect(index).toContain(
			"import $createsetupintent from './create-setup-intent.js';"
		);
		expect(index).toContain("describe: 'Operations for billing-profiles',");
	});

	it("makes a command of each alias", () => {
		const d = doc({
			"/accounts/{account_id}/things": {
				get: {
					operationId: "things-list",
					summary: "List things",
					parameters: [account()],
					responses: ok(),
					"x-forge-aliases": [
						{
							"x-fern-sdk-group-name": "things",
							"x-fern-sdk-method-name": "list",
						},
						{
							"x-fern-sdk-group-name": "stuff",
							"x-fern-sdk-method-name": "list",
							"x-forge-hidden": true,
						},
					],
				},
			},
		});
		expect(meta(d, "cf things list")["operationId"]).toBe("things.list");
		const stuff = meta(d, "cf stuff list");
		expect(stuff["operationId"]).toBe("stuff.list");
		expect(stuff["hideCommand"]).toBe(true);
	});

	it("names body flags after the wire names unless renamed", () => {
		const code = file(
			create({
				type: "object",
				required: ["display_name"],
				properties: {
					display_name: { type: "string", description: "The name." },
					ttlSeconds: { type: "integer", nullable: true },
					token_value: {
						type: "string",
						"x-fern-property-name": "secretToken",
						"x-sensitive": true,
					},
					id: { type: "string", readOnly: true },
					kind: { type: "string", enum: ["a", "b"], default: "a" },
				},
			}),
			"things/create.ts"
		);
		expect(code).toContain(
			`.option('display-name', {"type":"string","description":"The name."})`
		);
		// A nullable integer is still a number.
		expect(code).toContain(`.option('ttl-seconds', {"type":"number"`);
		expect(code).toContain(".option('secret-token'");
		expect(code).toContain(`sensitiveBodyPaths: [["token_value"]]`);
		expect(code).not.toContain("'id'");
		expect(code).toContain(`"choices":["a","b"],"default":"a"`);
		expect(code).toContain("promptForRequiredField('display-name'");
	});

	it("makes the members of a union conflict", () => {
		const code = file(
			create(
				{
					oneOf: [
						{ $ref: "#/components/schemas/ByName" },
						{
							type: "object",
							required: ["id"],
							properties: { id: { type: "string" } },
						},
					],
				},
				{
					ByName: {
						type: "object",
						required: ["name"],
						properties: { name: { type: "string" } },
					},
				}
			),
			"things/create.ts"
		);
		expect(code).toContain(".conflicts('name', ['id'])");
		expect(code).toContain(".conflicts('id', ['name'])");
	});

	it("describes the operation a typed call sends", () => {
		const textGet = doc({
			"/accounts/{account_id}/things/{thing_id}": {
				parameters: [
					account(),
					{
						name: "thing_id",
						in: "path",
						required: true,
						schema: { type: "string" },
					},
				],
				get: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "get",
					summary: "Get a thing",
					responses: {
						"200": {
							description: "OK",
							content: { "text/csv": { schema: { type: "string" } } },
						},
						"404": { description: "Not found" },
					},
				},
			},
		});
		const get = file(textGet, "things/get.ts");
		// A text response is read raw, so the command sends no typed request.
		expect(get).not.toContain("const operation");
		expect(get).toContain("fetchRawBytes");

		const d = doc({
			"/accounts/{account_id}/things": {
				get: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "list",
					summary: "List things",
					parameters: [
						account(),
						{
							name: "fields",
							in: "query",
							explode: false,
							schema: { type: "array", items: { type: "string" } },
						},
						{
							name: "since",
							in: "query",
							schema: { oneOf: [{ type: "string" }, { type: "integer" }] },
						},
					],
					responses: { ...ok(), "404": { description: "Not found" } },
					"x-fern-pagination": { results: "$response.result" },
				},
			},
		});
		const files = generateFiles(d);
		expect(files.get("things/list.ts")).toContain(
			"import operation from '../_operations/things/list.js';"
		);
		const code = operation(files, "things/list");
		expect(code).toContain(`query: ["fields", "since"],`);
		expect(code).toContain(`joined: ["fields"],`);
		// A union is sent as the flag's string, like any other value.
		expect(code).not.toContain("json:");
		expect(code).toContain(`404: "NotFoundError",`);
		// Pages are not read.
		expect(code).not.toContain("page:");
	});

	it("sends a passthrough request for a renamed path parameter", () => {
		const code = file(
			doc({
				"/accounts/{account_id}/things/{thing_id}": {
					get: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "get",
						summary: "Get a thing",
						parameters: [
							account(),
							{
								name: "thing_id",
								in: "path",
								required: true,
								"x-fern-parameter-name": "thing",
								schema: { type: "string" },
							},
						],
						responses: ok(),
					},
				},
			}),
			"things/get.ts"
		);
		expect(code).toContain(".positional('thing'");
		expect(code).toContain(`requestApi<unknown>(client, "GET"`);
		expect(code).not.toContain("const operation");
	});

	it("passes a JSON body whole, shared or not", () => {
		const op = (name: string, schema: Json) => ({
			"x-fern-sdk-group-name": "things",
			"x-fern-sdk-method-name": name,
			summary: "S",
			parameters: [account()],
			requestBody: {
				required: true,
				content: { "application/json": { schema } },
			},
			responses: ok(),
		});
		const shared = { $ref: "#/components/schemas/Thing" };
		const d = doc(
			{
				"/accounts/{account_id}/things": {
					post: op("create", shared),
					put: op("replace", shared),
					patch: op("edit", {
						type: "object",
						properties: { name: { type: "string" } },
					}),
				},
			},
			{ Thing: { type: "object", properties: { name: { type: "string" } } } }
		);
		const files = generateFiles(d);
		for (const name of ["create", "replace", "edit"]) {
			expect(operation(files, `things/${name}`)).toContain(`body: "json",`);
			const code = files.get(`things/${name}.ts`) ?? "";
			expect(code).toContain(
				"client.send(operation, { body: bodyData, account_id: accountId })"
			);
		}
	});

	it("fills in the fields of a body that allow one value", () => {
		const thing = {
			type: "object",
			required: ["kind", "name"],
			properties: {
				kind: { type: "string", enum: ["widget"] },
				name: { type: "string" },
			},
		};
		const op = (name: string) => ({
			"x-fern-sdk-group-name": "things",
			"x-fern-sdk-method-name": name,
			summary: "S",
			parameters: [account()],
			requestBody: {
				required: true,
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/Thing" },
					},
				},
			},
			responses: ok(),
		});
		const d = doc(
			{
				"/accounts/{account_id}/things": {
					post: op("create"),
					put: op("replace"),
				},
			},
			{ Thing: thing }
		);
		expect(operation(generateFiles(d), "things/create")).toContain(
			`constants: {\n    kind: "widget",\n  },`
		);
	});

	it("sends an empty body when it needs none of its fields", () => {
		const code = file(
			create(
				{
					type: "object",
					properties: {
						settings: { type: "array", items: { type: "boolean" } },
					},
				},
				{},
				false
			),
			"things/create.ts"
		);
		expect(code).toContain(
			"client.send(operation, { body: {}, account_id: accountId })"
		);
	});

	it("requires --body for a required body none of whose fields has a flag", () => {
		const code = file(
			create({
				type: "object",
				properties: {
					settings: { type: "array", items: { type: "boolean" } },
				},
			}),
			"things/create.ts"
		);
		expect(code).toContain("--body is required for this command.");
		expect(code).not.toContain("client.send(operation, { body: {}");
	});

	it("exports every operation for hand-written commands to import", () => {
		const d = doc({
			"/accounts/{account_id}/things": {
				get: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "list",
					summary: "List things",
					parameters: [account()],
					responses: ok(),
				},
				post: {
					"x-fern-sdk-group-name": ["things", "old"],
					"x-fern-sdk-method-name": "create",
					summary: "Create a thing",
					parameters: [account()],
					responses: ok(),
					"x-fern-availability": "deprecated",
				},
			},
		});
		const files = generateFiles(d);
		// One module per operation, at its path in the group tree, which
		// imports only the runtime's path tag, so any module can import it.
		const module = files.get("_operations/things/list.ts") ?? "";
		expect(module.match(/^import .*$/gm)).toEqual([
			'import { path } from "#api";',
		]);
		expect(operation(files, "things/list")).toContain(
			"path: (request: Record<string, unknown>) => path`/accounts/${request.account_id}/things`,"
		);
		// Named by its group, fully qualified, and its method.
		expect(module).toMatch(/^\/\*\* @generated from things\.list \*\/\n/);
		// A deprecated method has no command, but its operation is exported.
		expect(files.has("things/old/create.ts")).toBe(false);
		expect(operation(files, "things/old/create")).toContain(`method: "POST",`);
	});

	it("writes a path without parameters as a constant", () => {
		const files = generateFiles(
			doc({
				"/user": {
					get: {
						"x-fern-sdk-group-name": "user",
						"x-fern-sdk-method-name": "get",
						summary: "Get the user",
						responses: ok(),
					},
				},
			})
		);
		const module = files.get("_operations/user/get.ts") ?? "";
		expect(module).not.toMatch(/^import /m);
		expect(operation(files, "user/get")).toContain('path: () => "/user",');
	});

	it("reads a parameter that is no identifier by its name", () => {
		const files = generateFiles(
			doc({
				"/accounts/{account_id}/things/{thing-id}": {
					get: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "get",
						summary: "Get a thing",
						parameters: [
							account(),
							{
								name: "thing-id",
								in: "path",
								required: true,
								schema: { type: "string" },
							},
						],
						responses: ok(),
					},
				},
			})
		);
		expect(operation(files, "things/get")).toContain(
			'path`/accounts/${request.account_id}/things/${request["thing-id"]}`'
		);
	});

	it("lists the path parameters a form body leaves out", () => {
		const files = generateFiles(
			doc({
				"/accounts/{account_id}/things": {
					post: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "upload",
						summary: "Upload a thing",
						parameters: [account()],
						requestBody: {
							content: {
								"multipart/form-data": {
									schema: {
										type: "object",
										properties: { file: { type: "string", format: "binary" } },
									},
								},
							},
						},
						responses: ok(),
					},
					put: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "replace",
						summary: "Replace things",
						parameters: [account()],
						requestBody: {
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: { name: { type: "string" } },
									},
								},
							},
						},
						responses: ok(),
					},
				},
			})
		);
		const op = operation(files, "things/upload");
		expect(op).toContain('pathParams: ["account_id"],');
		expect(op).toContain('body: "form",');
		// A JSON body is the request's `body`, so it needs no such list.
		expect(operation(files, "things/replace")).toContain('body: "json",');
		expect(operation(files, "things/replace")).not.toContain("pathParams");
	});

	it("describes a body flag by the schema its allOf refers to", () => {
		const code = file(
			doc(
				{
					"/tunnels": {
						post: {
							"x-fern-sdk-group-name": "tunnels",
							"x-fern-sdk-method-name": "create",
							summary: "Create a tunnel",
							requestBody: {
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												// Wrapped only to rename the flag.
												config_src: {
													allOf: [{ $ref: "#/components/schemas/config_src" }],
													"x-fern-property-name": "config-source",
												},
												name: {
													description: "Its own description.",
													allOf: [{ $ref: "#/components/schemas/config_src" }],
												},
											},
										},
									},
								},
							},
							responses: ok(),
						},
					},
				},
				{
					config_src: {
						description: "Where the tunnel is configured.",
						type: "string",
						enum: ["local", "cloudflare"],
					},
				}
			),
			"tunnels/create.ts"
		);
		expect(code).toContain(
			`.option('config-source', {"type":"string","description":"Where the tunnel is configured.",`
		);
		// A field's own description wins.
		expect(code).toContain(
			`.option('name', {"type":"string","description":"Its own description.",`
		);
	});

	it("makes header parameters flags", () => {
		const code = file(
			doc({
				"/accounts/{account_id}/things": {
					get: {
						"x-fern-sdk-group-name": "things",
						"x-fern-sdk-method-name": "list",
						summary: "List things",
						parameters: [
							account(),
							{
								name: "cf-r2-jurisdiction",
								in: "header",
								"x-fern-parameter-name": "jurisdiction",
								schema: { type: "string" },
							},
						],
						responses: ok(),
					},
				},
			}),
			"things/list.ts"
		);
		expect(code).toContain(
			`.option('jurisdiction', {"type":"string","description":"The cf-r2-jurisdiction header"})`
		);
		expect(code).toContain(
			`headers['cf-r2-jurisdiction'] = String(argv["jurisdiction"])`
		);
	});

	it("describes a parameter by the schema its allOf refers to", () => {
		const code = file(
			doc(
				{
					"/accounts/{account_id}/things": {
						get: {
							"x-fern-sdk-group-name": "things",
							"x-fern-sdk-method-name": "list",
							summary: "List things",
							parameters: [
								account(),
								{
									name: "cf-storage-class",
									in: "header",
									schema: { allOf: [{ $ref: "#/components/schemas/Class" }] },
								},
								{
									name: "class",
									in: "query",
									schema: { allOf: [{ $ref: "#/components/schemas/Class" }] },
								},
								{
									name: "described",
									in: "query",
									description: "Its own.",
									schema: { allOf: [{ $ref: "#/components/schemas/Class" }] },
								},
							],
							responses: ok(),
						},
					},
				},
				{
					Class: {
						type: "string",
						enum: ["Standard", "InfrequentAccess"],
						description: "Storage class for new objects.",
					},
				}
			),
			"things/list.ts"
		);
		expect(code).toMatch(
			/\.option\('cf-storage-class', \{[^}]*"description":"Storage class for new objects\."/
		);
		expect(code).toMatch(
			/\.option\('class', \{[^}]*"description":"Storage class for new objects\."/
		);
		expect(code).toMatch(
			/\.option\('described', \{[^}]*"description":"Its own\."/
		);
	});

	it("leaves the members of an anyOf to the body", () => {
		const code = file(
			create({
				anyOf: [
					{
						type: "object",
						properties: { tags: { type: "array", items: { type: "string" } } },
					},
					{
						type: "object",
						properties: { hosts: { type: "array", items: { type: "string" } } },
					},
				],
			}),
			"things/create.ts"
		);
		expect(code).not.toContain("'tags'");
		expect(code).not.toContain("'hosts'");
		expect(code).not.toContain(".conflicts(");
		expect(code).toContain(".option('body'");
	});

	it("still sends an object body without properties", () => {
		const code = file(
			create({ type: "object", required: ["id"] }),
			"things/create.ts"
		);
		expect(code).toContain(".option('body'");
	});

	it("describes a body by its schema, never its title", () => {
		expect(
			file(
				create({
					type: "array",
					items: { type: "string" },
					description: "Some names.",
				}),
				"things/create.ts"
			)
		).toContain("description: 'Some names.',");

		const code = file(
			create(
				{ $ref: "#/components/schemas/Thing" },
				{
					Thing: {
						type: "object",
						title: "Thing Input",
						properties: { name: { type: "string" } },
					},
				}
			),
			"things/create.ts"
		);
		expect(code).toContain(
			"description: 'Raw JSON request body (bypasses individual flags)',"
		);
		expect(code).not.toContain("Thing Input");
	});

	it("gives a oneOf of a value or a list no one type", () => {
		const values = { type: "string", enum: ["running", "done"] };
		const queryType = (d: ReturnType<typeof doc>) =>
			(
				JSON.parse(file(d, "_meta/schemas.json")) as {
					schemas: Record<string, { queryParams: { type: string }[] }>;
				}
			).schemas["things list"]?.queryParams[0]?.type;

		// Comma-separated values would fail the choices.
		const oneOf = listing({
			oneOf: [values, { type: "array", items: values }],
		});
		expect(file(oneOf, "things/list.ts")).not.toContain("choices");
		expect(queryType(oneOf)).toBe("unknown");

		// Repeated values each pass the choices.
		const anyOf = listing({
			anyOf: [values, { type: "array", items: values }],
		});
		expect(file(anyOf, "things/list.ts")).toContain(
			`"choices":["running","done"]`
		);
		expect(queryType(anyOf)).toBe("string");
	});

	it("leaves out a command with nothing to call", () => {
		const d = doc({
			"/accounts/{account_id}/things": {
				get: {
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "list",
					summary: "List things",
					parameters: [account()],
					responses: ok(),
					"x-fern-availability": "deprecated",
				},
			},
			"/accounts/{account_id}/stuff/usage": {
				get: {
					"x-fern-sdk-group-name": ["stuff", "usage"],
					"x-fern-sdk-method-name": "get",
					summary: "Usage",
					parameters: [account()],
					responses: ok(),
					"x-fern-availability": "deprecated",
				},
			},
			"/accounts/{account_id}/stuff": {
				get: {
					"x-fern-sdk-group-name": "stuff",
					"x-fern-sdk-method-name": "list",
					summary: "List stuff",
					parameters: [account()],
					responses: ok(),
				},
			},
		});
		const files = generateFiles(d);
		expect([...files.keys()].filter((p) => p.startsWith("things/"))).toEqual(
			[]
		);
		const index = files.get("index.ts") ?? "";
		expect(index).not.toContain("'things'");
		expect(index).toContain("'stuff'");
		const { descriptions } = JSON.parse(
			files.get("_meta/commands.json") ?? "{}"
		) as CommandsFile;
		expect(Object.keys(descriptions)).not.toContain("things");
		expect(Object.keys(descriptions)).not.toContain("stuff usage");
	});

	it("makes a list of anyOf objects a JSON flag", () => {
		const code = file(
			create({
				type: "object",
				properties: {
					filters: {
						type: "array",
						items: {
							anyOf: [
								{ type: "object", properties: { key: { type: "string" } } },
								{ type: "object", properties: { kind: { type: "string" } } },
							],
						},
					},
				},
			}),
			"things/create.ts"
		);
		expect(code).toContain(".option('filters'");
	});

	it("publishes an object array as one string option in command metadata", () => {
		const d = doc({
			"/accounts/{account_id}/workers/deployments": {
				post: {
					operationId: "workers-deployments-create",
					"x-fern-sdk-group-name": ["workers", "deployments"],
					"x-fern-sdk-method-name": "create",
					description: "Create a deployment",
					parameters: [account()],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["versions"],
									properties: {
										versions: {
											type: "array",
											description: "Deployment versions as JSON.",
											items: {
												type: "object",
												properties: { version_id: { type: "string" } },
											},
										},
									},
								},
							},
						},
					},
					responses: ok(),
				},
			},
		});
		const command = meta(d, "cf workers deployments create") as {
			arguments: Json[];
			options: Json[];
		};
		expect(command.arguments.some((a) => a["name"] === "versions")).toBe(false);
		const versions = command.options.find((o) => o["name"] === "versions");
		expect(versions?.["type"]).toBe("string");
		expect(versions?.["required"]).toBe(true);
	});
});

describe("nested JSON array body flags", () => {
	it.each([
		[
			"objects",
			{ type: "object", properties: { value: { type: "string" } } },
			"parseObjectArray",
		],
		[
			"arrays",
			{
				type: "array",
				items: { type: "object", properties: { value: { type: "string" } } },
			},
			"parseNestedArray",
		],
	])(
		"retains required arrays of %s in an optional parent",
		(_name, items, parser) => {
			const d = create(
				{
					type: "object",
					properties: {
						settings: {
							allOf: [{ $ref: "#/components/schemas/Settings" }],
						},
					},
				},
				{
					Settings: {
						type: "object",
						required: ["entries", "labels"],
						properties: {
							entries: { type: "array", items },
							labels: { type: "array", items: { type: "string" } },
							version: { type: "integer" },
						},
					},
				}
			);
			const files = generateFiles(d);
			const code = files.get("things/create.ts") ?? "";
			expect(code).toContain(
				`${parser}(argv["settings-entries"], "settings-entries")`
			);
			expect(code).toContain(
				"const missing = ['settings-entries', 'settings-labels']"
			);
			const commands = JSON.parse(
				files.get("_meta/commands.json") ?? "{}"
			) as CommandsFile;
			const options = commands.commands.find(
				(c) => c["command"] === "cf things create"
			)?.["options"];
			expect(options).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						name: "settings-entries",
						type: "string",
						required: false,
					}),
				])
			);
			const schemas = JSON.parse(files.get("_meta/schemas.json") ?? "{}");
			expect(schemas.schemas["things create"].requestBodyFields).toContainEqual(
				expect.objectContaining({ name: "settings-entries", type: "string" })
			);
		}
	);
});

describe("JSON map body flags", () => {
	it("emits lossless map flags through references, allOf, and nested objects", () => {
		const d = create(
			{
				type: "object",
				properties: {
					tags: {
						allOf: [{ $ref: "#/components/schemas/Tags" }],
						"x-fern-property-name": "labels",
					},
					settings: {
						type: "object",
						properties: { labels: { $ref: "#/components/schemas/Tags" } },
					},
				},
				required: ["tags"],
			},
			{ Tags: { type: "object", additionalProperties: { type: "string" } } }
		);
		const code = file(d, "things/create.ts");
		expect(code).toContain('parseJsonMap(argv["labels"], "labels", true)');
		expect(code).toContain(
			'parseJsonMap(argv["settings-labels"], "settings-labels")'
		);
		expect(code).toContain('[["tags"],["settings","labels"]]');
		const options = meta(d, "cf things create")["options"] as Json[];
		expect(options).toContainEqual(
			expect.objectContaining({
				name: "labels",
				type: "string",
				required: true,
			})
		);
		expect(options).toContainEqual(
			expect.objectContaining({
				name: "settings-labels",
				type: "string",
				required: false,
			})
		);
	});
});
