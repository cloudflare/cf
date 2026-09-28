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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/api-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 api-security schema-validation schemas create\n\nUploads an OpenAPI schema that defines expected request formats for API operations."
		)
		.option("kind", {
			type: "string",
			description: "The kind of the schema",
			choices: ["openapi_v3"],
		})
		.option("name", {
			type: "string",
			description: "A human-readable name for the schema",
		})
		.option("source", {
			type: "string",
			description:
				"The raw schema, e.g., the OpenAPI schema, either as JSON or YAML",
		})
		.option("validation-enabled", {
			type: "boolean",
			description: "An indicator if this schema is enabled",
		})
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

type Request = SdkRequest<"schema-validation-create-schema">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Upload a schema",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation schemas create",
				classification: {
					safeFlags: ["kind", "validation-enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security schema-validation schemas create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/schemas`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										kind: resolveFileToken(
											argv["kind"] as string | undefined,
											"kind",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										source: resolveFileToken(
											argv["source"] as string | undefined,
											"source",
											"text"
										),
										validation_enabled: argv["validation-enabled"],
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.apiSecurity.schemaValidation.schemas.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["kind"] === undefined) {
					argv["kind"] = await promptForRequiredEnumField(
						"kind",
						"The kind of the schema",
						["openapi_v3"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"A human-readable name for the schema"
					);
				}
				if (argv["source"] === undefined) {
					argv["source"] = await promptForRequiredField(
						"source",
						"The raw schema, e.g., the OpenAPI schema, either as JSON or YAML"
					);
				}
				if (argv["validation-enabled"] === undefined) {
					throw new Error(
						"--validation-enabled is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					kind: resolveFileToken(
						argv["kind"] as string | undefined,
						"kind",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					source: resolveFileToken(
						argv["source"] as string | undefined,
						"source",
						"text"
					),
					validation_enabled: argv["validation-enabled"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.apiSecurity.schemaValidation.schemas.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
