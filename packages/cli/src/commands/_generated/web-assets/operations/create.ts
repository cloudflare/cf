import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/web-assets.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 web-assets operations create\n\nCreates one web or API operation. The host, method, and path are normalized; an existing matching operation is returned instead of duplicated."
		)
		.option("endpoint", {
			type: "string",
			description:
				"The endpoint which can contain path parameter templates in curly braces, each will be replaced from left to right with {varN}, starting with {var1}, during insertion. This will further be Cloudflare-normalized upon insertion. See: https://developers.cloudflare.com/rules/normalization/how-it-works/.",
		})
		.option("host", { type: "string", description: "RFC3986-compliant host." })
		.option("method", {
			type: "string",
			description: "The HTTP method used to access the endpoint.",
			choices: [
				"GET",
				"POST",
				"HEAD",
				"OPTIONS",
				"PUT",
				"DELETE",
				"CONNECT",
				"PATCH",
				"TRACE",
			],
		})
		.coerce("method", (value: string | undefined) =>
			resolveFileToken(value, "method", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"api-shield-endpoint-management-add-operation-to-a-zone">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a web or API operation",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web-assets operations create",
				classification: {
					safeFlags: ["method", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets operations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/operations/item`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										endpoint: resolveFileToken(
											argv["endpoint"] as string | undefined,
											"endpoint",
											"text"
										),
										host: resolveFileToken(
											argv["host"] as string | undefined,
											"host",
											"text"
										),
										method: argv["method"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.webAssets.operations.create({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["endpoint"] === undefined) {
					argv["endpoint"] = await promptForRequiredField(
						"endpoint",
						"The endpoint which can contain path parameter templates in curly braces, each will be replaced from left to right with {varN}, starting with {var1}, during insertion. This will further be Cloudflare-normalized upon insertion. See: https://developers.cloudflare.com/rules/normalization/how-it-works/."
					);
				}
				if (argv["host"] === undefined) {
					argv["host"] = await promptForRequiredField(
						"host",
						"RFC3986-compliant host."
					);
				}
				if (argv["method"] === undefined) {
					argv["method"] = await promptForRequiredEnumField(
						"method",
						"The HTTP method used to access the endpoint.",
						[
							"GET",
							"POST",
							"HEAD",
							"OPTIONS",
							"PUT",
							"DELETE",
							"CONNECT",
							"PATCH",
							"TRACE",
						] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					endpoint: resolveFileToken(
						argv["endpoint"] as string | undefined,
						"endpoint",
						"text"
					),
					host: resolveFileToken(
						argv["host"] as string | undefined,
						"host",
						"text"
					),
					method: argv["method"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.webAssets.operations.create({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
