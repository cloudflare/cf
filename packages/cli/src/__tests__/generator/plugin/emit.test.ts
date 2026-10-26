import { Script } from "node:vm";
import { describe, expect, it } from "vite-plus/test";
import yargs, { type Argv } from "yargs";
import { builderLines } from "../../../../generator/plugin/emit/builder.js";
import {
	bodyObject,
	bodyPrompts,
	dryRun,
	handler,
	variantPromptBlock,
} from "../../../../generator/plugin/emit/handler.js";
import { context as emitContext } from "../../../../generator/plugin/emit/index.js";
import {
	leafUsage,
	summary,
	telemetrySafeFlags,
} from "../../../../generator/plugin/files.js";
import {
	arg,
	bodyParam,
	context,
	find,
	method,
	operation,
	param,
	wire,
} from "../../helpers/cli-plugin.js";
import type { Arg, ArgType } from "../../../../generator/plugin/args.js";
import type { Method } from "../../../../generator/plugin/commands.js";
import type { OperationInfo } from "../../../../generator/plugin/operation.js";

describe("descriptions", () => {
	it("labels POST validation without claiming to create a resource", () => {
		const ctx = context(
			method("validate", "things-validate"),
			"things",
			operation("post", "/things/validate")
		);
		expect(ctx.progressLabel).toBe("Validating");
		expect(ctx.successLabel).toBe("Validated");
	});

	it("retains destructive confirmation labels for validation operations", () => {
		const ctx = context(
			method("validate", "things-validate", {
				requireConfirmation: "This operation deletes data.",
			}),
			"things",
			operation("post", "/things/validate")
		);
		expect(ctx.progressLabel).toBe("Deleting");
		expect(ctx.successLabel).toBe("Deleted");
	});

	const description = "Full first line.\nFull second line.";
	const list = (s: string | undefined, d: string) =>
		method("list", "test-list", { summary: s, description: d });

	it("uses the method summary for compact contexts", () => {
		expect(summary(list("  List test records  ", description))).toBe(
			"List test records"
		);
	});

	it("falls back to the first description line", () => {
		expect(summary(list(undefined, `\n${description}`))).toBe(
			"Full first line."
		);
	});

	it("uses the full description in leaf help usage", () => {
		expect(
			leafUsage(
				list(undefined, description),
				"test",
				"records/nested",
				"list <id>"
			)
		).toBe(
			"$0 test records nested list <id>\n\nFull first line.\nFull second line."
		);
	});
});

describe("delete confirmation", () => {
	it("leaves the declined message to confirmDelete", () => {
		const ctx = context(
			method("delete", "things-delete"),
			"things",
			operation("delete", "/things/{thing_id}", {
				pathParams: [param("thing_id")],
			})
		);
		const output = handler(ctx).join("\n");
		expect(output).toContain(
			"if (!(await confirmDelete({ force: Boolean(argv.force) }))) {\n        return;\n      }"
		);
		expect(output).not.toContain("Aborted");
	});
});

describe("telemetry", () => {
	const flag = (name: string, type: ArgType, rest: Partial<Arg> = {}) =>
		arg(name, type, { in: "body", path: [name] }, rest);

	it("excludes sensitive boolean and enum fields", () => {
		const args = [
			flag("public-boolean", "boolean"),
			flag("public-enum", "enum"),
			flag("sortBy", "enum"),
			flag("secret-boolean", "boolean", { secret: true }),
			flag("secret-enum", "enum", { secret: true }),
			flag("positional-boolean", "boolean", { positional: true }),
			flag("free-form", "string"),
		];
		expect(telemetrySafeFlags(args, false, false)).toEqual([
			"public-boolean",
			"public-enum",
			"sort-by",
			"dry-run",
		]);
	});

	it("includes generator-owned boolean flags", () => {
		expect(telemetrySafeFlags([], true, false)).toEqual(["dry-run", "force"]);
		expect(telemetrySafeFlags([], false, true)).toEqual(["dry-run", "text"]);
	});
});

describe("dry run with mixed content", () => {
	it("previews the file selected by the live handler before a JSON body", () => {
		const op = operation("patch", "/uploads", {
			hasRequestBody: true,
			requestContentTypes: ["application/json", "application/merge-patch+json"],
		});
		const ctx = context(method("upload", "uploads-upload"), "uploads", op);
		const d = ctx.derived;
		expect(d.args).toEqual([]);
		expect([d.isMutating, d.hasBody, d.hasBodyParams, d.hasFileUpload]).toEqual(
			[true, true, false, true]
		);
		const output = dryRun(ctx).join("\n");
		expect(output).toContain(
			"bodyKind: argv.file !== undefined ? 'octet-stream' : 'json'"
		);
		expect(output).toContain(
			"body: argv.file !== undefined\n            ? { file: argv.file }\n            : argv.body !== undefined\n            ? parseBody(argv.body)"
		);
	});
});

describe("bodyless raw response emission", () => {
	it.each(["application/octet-stream", "text/plain"])(
		"forwards header flags for %s responses",
		(contentType) => {
			const ctx = context(
				method("get", "things-get"),
				"things",
				operation("get", "/things", {
					headerParams: [
						param("If-None-Match", undefined, { required: false }),
					],
					responses: [["200", { content: [contentType] }]],
				})
			);
			const output = handler(ctx).join("\n");
			expect(output).toContain("fetchRawBytes(");
			expect(output).toContain(
				"headers: Object.keys(headers).length > 0 ? headers : undefined"
			);
		}
	);
});

describe("protobuf response emission", () => {
	it("writes profile bytes directly while sending the JSON request body", () => {
		const op = operation(
			"post",
			"/accounts/{account_id}/workers/workers/{worker_id}/versions/{version_id}/profile",
			{
				pathParams: [
					param("account_id"),
					param("worker_id"),
					param("version_id"),
				],
				bodyParams: [
					bodyParam("duration_ms", "number", ["duration_ms"], {
						required: true,
					}),
				],
				hasRequestBody: true,
				requestContentTypes: ["application/json"],
				requestBodyRequired: ["duration_ms"],
				responses: [["200", { content: ["application/vnd.google.protobuf"] }]],
			}
		);
		const ctx = context(
			method("profile", "workers.versions.profile"),
			"workers",
			op
		);
		expect(ctx.outputKind).toBe("binary");
		const output = handler(ctx).join("\n");
		expect(output).toContain("fetchRawBytes(");
		expect(output).toContain("method: 'POST'");
		expect(output).toContain("body: JSON.stringify(bodyData)");
		expect(output).toContain(
			"body: Object.keys(bodyData).length > 0 ? bodyData : undefined"
		);
		expect(output).toContain("contentType: 'application/json'");
		expect(output).toContain(
			"writeRawOutput(argv.text === true ? __cfRawBytes.toString('utf-8') : __cfRawBytes)"
		);
		expect(output).not.toContain("formatOutput(");
	});
});

describe("variant prompts", () => {
	const bodyArg = (name: string, type: ArgType, rest: Partial<Arg> = {}) =>
		arg(name, type, { in: "body", path: [name.replaceAll("-", "_")] }, rest);
	const discriminated = (variants: [string, string[]][]): OperationInfo =>
		operation("post", "/", {
			bodyDiscriminator: { field: "kind", variants },
		});
	const block = (op: OperationInfo, args: Arg[]): [string, boolean] => {
		const [lines, needsText] = variantPromptBlock(op, args);
		return [lines.join("\n"), needsText];
	};

	it("prompts for missing string fields", () => {
		const [lines, needsText] = block(discriminated([["report", ["reason"]]]), [
			bodyArg("kind", "string"),
			bodyArg("reason", "string"),
		]);
		expect(needsText).toBe(true);
		expect(lines).toContain(
			`argv["reason"] = await promptForRequiredField('reason'`
		);
	});

	it("recognizes a positional discriminator", () => {
		const [lines, needsText] = block(discriminated([["report", ["reason"]]]), [
			bodyArg("kind", "string", { positional: true }),
			bodyArg("reason", "string"),
		]);
		expect(needsText).toBe(true);
		expect(lines).toContain(
			`if (argv["kind"] === 'report' && argv["reason"] === undefined)`
		);
	});

	it.each(["number", "boolean", "array"] as const)(
		"requires missing %s fields without prompting",
		(type) => {
			const [lines, needsText] = block(discriminated([["report", ["value"]]]), [
				bodyArg("kind", "string"),
				bodyArg("value", type),
			]);
			expect(needsText).toBe(false);
			expect(lines).toContain(
				"throw new Error('--value is required (or pass --body with this field set).');"
			);
			expect(lines).not.toContain("promptForRequiredField");
		}
	);

	it("requires --body when a variant has an unexposed required field", () => {
		const [lines, needsText] = block(
			discriminated([["key", ["algorithm", "format"]]]),
			[bodyArg("kind", "string"), bodyArg("format", "enum")]
		);
		expect(needsText).toBe(false);
		expect(lines).toContain(
			"The key variant requires algorithm, which cannot be supplied as flags. Pass --body"
		);
		expect(lines).not.toContain("promptForRequiredField");
	});
});

describe("file-backed enum arguments", () => {
	it("resolves enum file tokens before choices validation without reading twice", () => {
		const ctx = context(
			method("create", "example-create"),
			"example",
			operation("post", "/example", {
				queryParams: [
					param("sort", undefined, { enumValues: ["asc", "desc"] }),
				],
				bodyParams: [
					bodyParam("selection", "string", ["selection"], {
						enumValues: ["first", "second"],
					}),
					bodyParam("description", "string", ["description"]),
				],
				hasRequestBody: true,
				requestContentTypes: ["application/json"],
			})
		);
		const builder = builderLines(ctx).join("\n");
		const body = bodyObject(ctx, "").join("\n");

		expect(builder).toContain('"choices":["first","second"]');
		expect(builder).toContain(
			'.coerce("selection", (value) => resolveFileToken(value, "selection", "text"))'
		);
		expect(builder).not.toContain('.coerce("sort"');
		expect(builder).not.toContain('.coerce("description"');
		expect(body).toContain('selection: argv["selection"]');
		expect(body).toContain('resolveFileToken(argv["description"]');
	});
});

describe("passthrough body assembly", () => {
	it("sends an assembled body even when no flag set a field", () => {
		// A renamed path parameter keeps the command off the typed call.
		const ctx = context(
			method("create", "example-create"),
			"example",
			operation("post", "/accounts/{account_id}/things/{id}/jobs", {
				pathParams: [param("account_id"), param("id", "instance-id")],
				bodyParams: [bodyParam("description", "string", ["description"])],
				hasRequestBody: true,
				requestContentTypes: ["application/json"],
			})
		);
		const output = handler(ctx).join("\n");
		expect(output).toContain("requestApi<unknown>(");
		expect(output).toContain("{ body: bodyData }");
		expect(output).not.toContain("Object.keys(bodyData).length > 0");
	});
});

describe("object-array bodies", () => {
	const create = (tags: boolean): OperationInfo =>
		operation("post", "/tests", {
			bodyParams: [
				bodyParam("versions", "array", ["versions"], {
					itemType: "object",
					required: true,
				}),
				...(tags
					? [bodyParam("tags", "array", ["tags"], { itemType: "string" })]
					: []),
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
		});
	const createMethod = method("create", "tests-create");

	it("emits one string flag while scalar arrays remain repeatable", () => {
		const ctx = context(createMethod, "tests", create(true));
		expect(find(ctx.derived.args, "versions").type).toBe("objectArray");
		expect(find(ctx.derived.args, "tags").type).toBe("array");
		const lines = builderLines(ctx);
		const option = (name: string) => {
			const line = lines.find((l) => l.startsWith(`.option('${name}'`));
			if (line === undefined) {
				throw new Error(`no --${name} in ${lines.join("\n")}`);
			}
			return line;
		};
		expect(option("versions")).toContain(`"type":"string"`);
		expect(option("versions")).not.toContain(`"array":true`);
		expect(option("versions")).not.toContain(`"demandOption":true`);
		expect(option("tags")).toContain(`"type":"string"`);
		expect(option("tags")).toContain(`"array":true`);
	});

	it("parses the complete JSON value when assembling the body", () => {
		const ctx = context(createMethod, "tests", create(false));
		expect(bodyObject(ctx, "").join("\n")).toContain(
			`versions: parseObjectArray(argv["versions"], "versions")`
		);
	});

	it("requires the JSON flag after the --body bypass", () => {
		const ctx = context(createMethod, "tests", create(false));
		expect(ctx.variantPromptBlock).toEqual([]);
		expect(bodyPrompts(ctx).join("\n")).toContain(
			"throw new Error('--versions is required (or pass --body with this field set).')"
		);
	});
});

/**
 * Names that `x-fern-parameter-name` and `x-fern-property-name` give
 * parameters and body fields, which name flags; the request keeps the wire
 * names.
 */
describe("Fern names", () => {
	/** `queues-get-consumer`, with its path parameters renamed. */
	const renamedConsumerGet = () =>
		operation(
			"get",
			"/accounts/{account_id}/queues/{queue_id}/consumers/{consumer_id}",
			{
				pathParams: [
					param("account_id"),
					param("queue_id", "queue"),
					param("consumer_id", "consumer"),
				],
			}
		);
	const emit = (m: Method, op: OperationInfo) => {
		const ctx = context(m, "example", op);
		return {
			handler: handler(ctx).join("\n"),
			builder: builderLines(ctx).join("\n"),
			resolvedRequestPath: ctx.resolvedRequestPath,
		};
	};

	it.each([false, true])(
		"honors required %j when parsing the emitted consumer positional",
		async (required) => {
			const [ctx, command] = emitContext(
				method("get", "queues-get-consumer", {
					params: { consumer_id: { required } },
				}),
				"example",
				undefined,
				renamedConsumerGet(),
				"./"
			);
			expect(command).toBe(required ? "get <consumer>" : "get [consumer]");
			const builder = new Script(
				`(yargs) => yargs\n${builderLines(ctx).join("\n")}`
			).runInNewContext() as (args: Argv) => Argv;
			const parse = async (args: string[]) =>
				yargs(args)
					.exitProcess(false)
					.fail((message, error) => {
						throw error ?? new Error(message);
					})
					.command(command, "", builder, () => {})
					.strict()
					.parseAsync();
			expect(
				await parse(["get", "consumer-1", "--queue", "queue-1"])
			).toMatchObject({ consumer: "consumer-1", queue: "queue-1" });
			const omitted = parse(["get", "--queue", "queue-1"]);
			if (required) {
				await expect(omitted).rejects.toThrow(
					"Not enough non-option arguments"
				);
			} else {
				expect((await omitted).consumer).toBeUndefined();
			}
		}
	);

	it("reads renamed path args in the request and dry run", () => {
		const { handler: h, builder } = emit(method("get", "queues-get-consumer"), {
			...renamedConsumerGet(),
			wire: wire({ hasRequest: true }),
		});
		expect(builder).toContain(".positional('consumer'");
		expect(builder).toContain(".option('queue'");
		expect(builder).not.toContain("queue-id");
		expect(builder).not.toContain("consumer-id");

		// A renamed path parameter is sent with a passthrough request.
		expect(h).not.toContain("client.send(");
		expect(h).toContain(
			`/queues/\${encodeURIComponent(String(argv["queue"]))}/consumers/\${encodeURIComponent(String(argv["consumer"]))}`
		);
		expect(h).toContain(
			`/queues/\${argv["queue"] == null ? '<queue>' : encodeURIComponent(String(argv["queue"]))}`
		);
		expect(h).toContain(
			`/consumers/\${argv["consumer"] == null ? '<consumer>' : encodeURIComponent(String(argv["consumer"]))}`
		);
		expect(h).toContain(`"queue": String(argv["queue"] ?? '')`);
		expect(h).toContain(`"consumer": String(argv["consumer"] ?? '')`);
		expect(h).not.toContain(`argv["queue-id"]`);
		expect(h).not.toContain(`argv["consumer-id"]`);
	});

	it("substitutes renamed path args into the raw request URL", () => {
		const { handler: h, resolvedRequestPath } = emit(
			method("get", "example-without-sdk-entry"),
			renamedConsumerGet()
		);
		expect(resolvedRequestPath).toBe(
			`/accounts/\${accountId}/queues/\${encodeURIComponent(String(argv["queue"]))}/consumers/\${encodeURIComponent(String(argv["consumer"]))}`
		);
		expect(h).not.toContain(`argv["queue-id"]`);
	});

	it("does not treat a renamed path positional as a body field", () => {
		const op = operation("put", "/accounts/{account_id}/things/{thing_id}", {
			pathParams: [param("account_id"), param("thing_id", "thing")],
			bodyParams: [
				bodyParam("label", "string", ["label"], { description: "Label" }),
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
		});
		const { handler: h } = emit(
			method("update", "example-without-sdk-entry"),
			op
		);
		expect(h).toContain(`encodeURIComponent(String(argv["thing"]))`);
		expect(h).toContain(`setNestedValue(bodyData, ["label"]`);
		expect(h).not.toContain(`bodyData["thing"]`);
		expect(h).not.toMatch(/\bthing: /);
	});

	it("emits forge's renamed body flags, conflicts, and wire paths", () => {
		const op = operation("post", "/accounts/{account_id}/configs", {
			pathParams: [param("account_id")],
			bodyParams: [
				bodyParam(
					"mtls-certificate-id",
					"string",
					["mtls", "mtls_certificate_id"],
					{ description: "Certificate", conflicts: ["token"] }
				),
				bodyParam("token", "string", ["access_token"], {
					description: "Token",
					conflicts: ["mtls-certificate-id"],
				}),
			],
			hasRequestBody: true,
			requestContentTypes: ["application/json"],
		});
		const { handler: h, builder } = emit(
			method("create", "example-without-sdk-entry"),
			op
		);
		expect(builder).toContain(".option('mtls-certificate-id'");
		expect(builder).toContain(".option('token'");
		expect(builder).toContain(".conflicts('mtls-certificate-id', ['token'])");
		expect(builder).toContain(".conflicts('token', ['mtls-certificate-id'])");
		expect(h).toContain(
			`setNestedValue(bodyData, ["mtls", "mtls_certificate_id"], resolveFileToken(argv["mtls-certificate-id"]`
		);
		expect(h).toContain(
			`setNestedValue(bodyData, ["access_token"], resolveFileToken(argv["token"]`
		);
	});
});
