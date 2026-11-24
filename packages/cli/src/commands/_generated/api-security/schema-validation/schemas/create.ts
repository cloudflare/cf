import operation from "../../../_operations/api-security/schema-validation/schemas/create.js";
/**
 * create command
 * @generated from apis/overlays/api-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Upload a schema",
	usage:
		"$0 api-security schema-validation schemas create\n\nUploads an OpenAPI schema that defines expected request formats for API operations.",
	flags: {
		kind: {
			kind: "parsed",
			brief: "The kind of the schema",
			optional: true,
			choices: ["openapi_v3"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "kind", "text"),
		},
		name: {
			kind: "parsed",
			brief: "A human-readable name for the schema",
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief: "The raw schema, e.g., the OpenAPI schema, either as JSON or YAML",
			optional: true,
			parse: String,
		},
		"validation-enabled": {
			kind: "boolean",
			brief: "An indicator if this schema is enabled",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "api-security schema-validation schemas create",
				classification: {
					safeFlags: ["kind", "validation-enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
										kind: argv["kind"],
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					kind: argv["kind"],
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
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
