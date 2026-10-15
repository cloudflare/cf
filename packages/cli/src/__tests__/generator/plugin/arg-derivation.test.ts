import { describe, expect, it } from "vite-plus/test";
import {
	accountOrZoneLocal,
	type Derived,
	derive,
} from "../../../../generator/plugin/args.js";
import {
	bodyParam,
	find,
	method as baseMethod,
	names,
	operation,
	param,
} from "../../helpers/cli-plugin.js";
import type { Method } from "../../../../generator/plugin/commands.js";
import type {
	MultipartField,
	OperationInfo,
} from "../../../../generator/plugin/operation.js";

/** A method `name` with the `x-forge-params` overrides `params`. */
function method(params: Method["params"] | undefined, name: string): Method {
	return baseMethod(name, "example-search", { params });
}

const search = () => method(undefined, "search");

/** A GET with the required query parameter `name`, renamed to `sdkName`. */
function queryOperation(name: string, sdkName?: string): OperationInfo {
	return operation("get", "/accounts/{account_id}/example", {
		queryParams: [param(name, sdkName, { description: "Search query" })],
	});
}

/** A multipart POST whose fields include `mode` in three cases. */
function multipartOperation(): OperationInfo {
	const field = (name: string, description: string): MultipartField => ({
		name,
		type: "string",
		isBinary: false,
		description,
	});
	return operation("post", "/accounts/{account_id}/example", {
		hasRequestBody: true,
		requestContentTypes: ["multipart/form-data"],
		multipart: {
			fields: [
				field("mode", "Mode"),
				field("Mode", "Mixed-case mode"),
				field("MODE", "Uppercase mode"),
				field("label", "Label"),
			],
		},
	});
}

/** A GET at `path` with the path parameters `account_id` and `params`. */
function pathOperation(
	path: string,
	params: [string, string | undefined][]
): OperationInfo {
	return operation("get", path, {
		pathParams: [
			param("account_id"),
			...params.map(([name, sdk]) => param(name, sdk)),
		],
	});
}

const derived = (m: Method, resource: string, op: OperationInfo): Derived =>
	derive(m, resource, op);

describe("account-or-zone", () => {
	it("maps only the paired placeholders to generated locals", () => {
		const path = "/{account_or_zone}/{account_or_zone_id}/load_balancers";
		expect(accountOrZoneLocal(path, "account_or_zone")).toBe("accountOrZone");
		expect(accountOrZoneLocal(path, "account_or_zone_id")).toBe(
			"accountOrZoneId"
		);
		expect(accountOrZoneLocal(path, "load_balancer_id")).toBeUndefined();
		expect(
			accountOrZoneLocal("/things/{account_or_zone}", "account_or_zone")
		).toBeUndefined();
	});
});

describe("deriveArgsFromOp query flags", () => {
	it("names the flag from sdkName without changing the query wire name", () => {
		const d = derived(search(), "example", queryOperation("q", "query"));
		expect(find(d.args, "query").origin).toEqual({ in: "query", name: "q" });
	});

	it("kebab-cases a camelCase sdkName", () => {
		const d = derived(
			search(),
			"example",
			queryOperation("accountId", "filterAccountId")
		);
		expect(names(d.args)).toEqual(["filter-account-id"]);
	});

	it("lets sdkName move a query param off the reserved mode flag", () => {
		expect(derived(search(), "example", queryOperation("mode")).args).toEqual(
			[]
		);
		const d = derived(
			search(),
			"example",
			queryOperation("mode", "search-mode")
		);
		expect(find(d.args, "search-mode").origin).toEqual({
			in: "query",
			name: "mode",
		});
	});

	it("classifies by the wire name", () => {
		const d = derived(
			search(),
			"example",
			queryOperation("zone_id", "zone_tag")
		);
		expect(find(d.args, "zone-tag").isZone).toBe(true);
	});
});

describe("deriveArgsFromOp header flags", () => {
	it("names the flag from sdkName without changing the header wire name", () => {
		const op = operation("get", "/accounts/{account_id}/example", {
			headerParams: [
				param("cf-r2-jurisdiction", "jurisdiction", {
					required: false,
					description: "Jurisdiction",
				}),
			],
		});
		const d = derived(search(), "example", op);
		expect(find(d.args, "jurisdiction").origin).toEqual({
			in: "header",
			name: "cf-r2-jurisdiction",
		});
	});
});

describe("deriveArgsFromOp path params", () => {
	const consumerPath =
		"/accounts/{account_id}/queues/{queue_id}/consumers/{consumer_id}";
	const renamed: [string, string | undefined][] = [
		["queue_id", "queue"],
		["consumer_id", "consumer"],
	];

	it("keeps a defaulted path parameter optional beside a body positional", () => {
		const op = pathOperation(
			"/accounts/{account_id}/namespaces/{namespace}/things",
			[["namespace", undefined]]
		);
		op.bodyParams = [
			bodyParam("id", "string", ["id"], {
				required: true,
				description: "Thing ID",
			}),
		];
		const d = derived(
			method(
				{ namespace: { default: "default" }, id: { positional: true } },
				"create"
			),
			"example",
			op
		);
		expect(d.args).toEqual([
			expect.objectContaining({
				name: "namespace",
				required: false,
				positional: false,
				default: "default",
				origin: { in: "path", name: "namespace" },
			}),
			expect.objectContaining({
				name: "id",
				required: true,
				positional: true,
				origin: { in: "body", path: ["id"] },
			}),
		]);
	});

	it.each(["default", ""])(
		"never promotes a path parameter with default %j, even when explicitly positional",
		(defaultValue) => {
			const d = derived(
				method(
					{
						consumer_id: {
							default: defaultValue,
							positional: true,
							required: true,
						},
					},
					"get"
				),
				"example",
				pathOperation(consumerPath, renamed)
			);
			expect(find(d.args, "consumer")).toMatchObject({
				positional: false,
				required: false,
				default: defaultValue,
			});
		}
	);

	it("honors an explicit optional flag override", () => {
		const d = derived(
			method(
				{
					consumer_id: {
						required: false,
						positional: false,
						description: "Optional consumer",
					},
				},
				"get"
			),
			"example",
			pathOperation(consumerPath, renamed)
		);
		expect(find(d.args, "consumer")).toMatchObject({
			positional: false,
			required: false,
			description: "Optional consumer",
		});
	});

	it("honors explicit positional placement for a container parameter", () => {
		const d = derived(
			method(
				{ queue_id: { positional: true }, consumer_id: { positional: false } },
				"get"
			),
			"example",
			pathOperation(consumerPath, renamed)
		);
		expect(d.args.map((a) => [a.name, a.positional])).toEqual([
			["queue", true],
			["consumer", false],
		]);
	});

	it("honors required false for an optional positional", () => {
		const d = derived(
			method({ consumer_id: { required: false } }, "get"),
			"example",
			pathOperation(consumerPath, renamed)
		);
		expect(find(d.args, "consumer")).toMatchObject({
			positional: true,
			required: false,
		});
	});

	it("treats an explicit null default as no default", () => {
		const d = derived(
			method({ consumer_id: { default: null } }, "get"),
			"example",
			pathOperation(consumerPath, renamed)
		);
		const consumer = find(d.args, "consumer");
		expect(consumer).toMatchObject({ positional: true, required: true });
		expect(consumer.default).toBeUndefined();
	});

	it("names the positional and demoted flag from sdkName", () => {
		const d = derived(
			method(undefined, "get"),
			"example",
			pathOperation(consumerPath, renamed)
		);
		expect(names(d.args)).toEqual(["queue", "consumer"]);
		const [queue, consumer] = d.args;
		expect(queue?.positional).toBe(false);
		expect(queue?.required).toBe(true);
		expect(queue?.origin).toEqual({ in: "path", name: "queue_id" });
		expect(consumer?.positional).toBe(true);
		expect(consumer?.origin).toEqual({ in: "path", name: "consumer_id" });
	});

	it("demotes every renamed path param to a flag for list operations", () => {
		const d = derived(
			method(undefined, "list"),
			"example",
			pathOperation(consumerPath, renamed)
		);
		expect(d.args.map((a) => [a.name, a.positional, a.origin])).toEqual([
			["queue", false, { in: "path", name: "queue_id" }],
			["consumer", false, { in: "path", name: "consumer_id" }],
		]);
	});

	it("keeps wire-name zone and worker handling when renamed", () => {
		const zone = derived(
			method(undefined, "get"),
			"example",
			pathOperation("/zones/{zone_id}/things/{thing_id}", [
				["zone_id", "zone_tag"],
				["thing_id", undefined],
			])
		);
		expect(names(zone.args)).toEqual(["thing-id"]);

		const worker = derived(
			method(undefined, "get"),
			"workers",
			pathOperation(
				"/accounts/{account_id}/workers/scripts/{script_name}/settings",
				[["script_name", "worker_script"]]
			)
		);
		expect(names(worker.args)).toEqual(["worker"]);
		const [a] = worker.args;
		expect(a?.positional).toBe(false);
		expect(a?.isWorkerName).toBe(true);
		expect(a?.origin).toEqual({ in: "path", name: "script_name" });
	});

	it("does not let a rename make an ordinary param look like a zone", () => {
		const d = derived(
			method(undefined, "get"),
			"example",
			pathOperation("/accounts/{account_id}/things/{thing_id}", [
				["thing_id", "zone_id"],
			])
		);
		expect(names(d.args)).toEqual(["zone-id"]);
		expect(d.args[0]?.positional).toBe(true);
		expect(d.args[0]?.isZone).toBe(false);
	});
});

describe("deriveArgsFromOp body flags", () => {
	it("uses exact description overrides without inheriting parent object prose", () => {
		const op = operation("put", "/accounts/{account_id}/example", {
			bodyParams: [
				bodyParam("settings-enabled", "boolean", ["settings", "enabled"], {
					description: "Enable the setting",
				}),
				bodyParam("settings-label", "string", ["settings", "label"], {
					description: "API label",
				}),
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
		});
		const d = derived(
			method(
				{
					settings: { description: "Settings as JSON" },
					"settings.label": { description: "Choose a label" },
				},
				"update"
			),
			"example",
			op
		);
		expect(find(d.args, "settings-enabled").description).toBe(
			"Enable the setting"
		);
		expect(find(d.args, "settings-label").description).toBe("Choose a label");
	});

	it("uses a map description override and retains JSON input help", () => {
		const op = operation("put", "/accounts/{account_id}/example", {
			bodyParams: [
				bodyParam("tags", "object", ["tags"], { description: "API prose" }),
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
		});
		const d = derived(
			method(
				{ tags: { description: "Choose tags explicitly.", required: true } },
				"update"
			),
			"example",
			op
		);
		expect(find(d.args, "tags")).toMatchObject({
			type: "objectMap",
			required: true,
			description:
				"Choose tags explicitly. Provide as a JSON object or @path/to/file.json.",
		});
	});

	it("uses forge's Fern-derived names for flags and conflicts", () => {
		const op = operation("post", "/accounts/{account_id}/example", {
			bodyParams: [
				bodyParam(
					"mtls-certificate-id",
					"string",
					["mtls", "mtls_certificate_id"],
					{ description: "Certificate", conflicts: ["token"] }
				),
				bodyParam("token", "string", ["access_token"], {
					description: "Token",
					implies: ["mtls-certificate-id"],
				}),
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
		});
		const d = derived(method(undefined, "create"), "example", op);
		expect(names(d.args)).toEqual(["mtls-certificate-id", "token"]);
		expect(d.args[0]?.origin).toEqual({
			in: "body",
			path: ["mtls", "mtls_certificate_id"],
		});
		expect(d.args[0]?.conflicts).toEqual(["token"]);
		expect(d.args[1]?.origin).toEqual({ in: "body", path: ["access_token"] });
		expect(d.args[1]?.implies).toEqual(["mtls-certificate-id"]);
	});
});

describe("deriveArgsFromOp multipart flags", () => {
	it("omits reserved mode fields case-insensitively", () => {
		const d = derived(search(), "example", multipartOperation());
		expect(d.multipartFlagFields.map((f) => f.name)).toEqual(["label"]);
	});
});

describe("deriveArgsFromOp object-array body flags", () => {
	/** A deployment POST whose required `versions` is an array of `itemType`. */
	function versionsOperation(itemType?: string): OperationInfo {
		return operation("post", "/accounts/{account_id}/workers/deployments", {
			bodyParams: [
				bodyParam("versions", "array", ["versions"], {
					itemType,
					required: true,
					description: "Deployment versions as JSON.",
				}),
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
			requestBodyRequired: ["versions"],
		});
	}

	it("keeps an object array as one JSON-valued flag", () => {
		const d = derived(search(), "workers", versionsOperation("object"));
		const versions = find(d.args, "versions");
		expect(versions.type).toBe("objectArray");
		expect(versions.required).toBe(true);
		expect(versions.description).toBe(
			"Deployment versions as JSON. Provide as a JSON array of objects or @path/to/file.json."
		);
		expect(versions.origin).toEqual({ in: "body", path: ["versions"] });
		expect(d.hasBody).toBe(true);
		expect(d.hasBodyParams).toBe(true);
	});

	it("preserves scalar arrays as repeatable flags", () => {
		const d = derived(search(), "workers", versionsOperation());
		expect(find(d.args, "versions").type).toBe("array");
	});

	it("does not let scalar overlay choices replace the JSON representation", () => {
		const overrides = {
			versions: { choices: ["not-an-object-array"], positional: true },
		};
		const d = derived(
			method(overrides, "search"),
			"workers",
			versionsOperation("object")
		);
		const versions = find(d.args, "versions");
		expect(versions.type).toBe("objectArray");
		expect(versions.positional).toBe(false);
		expect(versions.choices).toBeUndefined();
	});
});

describe("nested body defaults", () => {
	const create = (
		bodyParams: OperationInfo["bodyParams"],
		required: string[]
	): OperationInfo =>
		operation("post", "/accounts/{account_id}/tests", {
			pathParams: [param("account_id")],
			bodyParams,
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
			requestBodyRequired: required,
		});
	const field = (
		name: string,
		path: string[],
		required: boolean,
		dflt?: string
	) => bodyParam(name, "string", path, { required, default: dflt });
	const createMethod = baseMethod("create", "test-create", {
		description: "Create a test resource",
	});
	const defaultFor = (op: OperationInfo, name: string) =>
		derive(createMethod, "test", op).args.find((a) => a.name === name)?.default;

	it("does not create an optional parent object", () => {
		const op = create(
			[
				field("format-type", ["format", "type"], true),
				field(
					"format-compression",
					["format", "compression"],
					false,
					"uncompressed"
				),
			],
			[]
		);
		const d = derive(createMethod, "test", op);
		expect(find(d.args, "format-compression").default).toBeUndefined();
		expect(d.optionalParentGroups).toEqual([
			{
				parentName: "format",
				groupSetFlags: ["format-type", "format-compression"],
				requiredFlags: ["format-type"],
			},
		]);
	});

	it("retains a nested default when its parent is required", () => {
		const op = create(
			[field("settings-mode", ["settings", "mode"], false, "automatic")],
			["settings"]
		);
		expect(defaultFor(op, "settings-mode")).toBe("automatic");
	});

	it("retains a default on a top-level field", () => {
		const op = create(
			[field("strategy", ["strategy"], false, "automatic")],
			[]
		);
		expect(defaultFor(op, "strategy")).toBe("automatic");
	});

	it("omits the reserved top-level mode field", () => {
		const op = create([field("mode", ["mode"], false, "automatic")], []);
		expect(names(derive(createMethod, "test", op).args)).not.toContain("mode");
	});
});
