import operation from "../../_operations/content-scan/expressions/update.js";
/**
 * update command
 * @generated from apis/overlays/content-scan.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <expression-id>",
	describe: "Update a Content Scanning custom expression for a zone.",
	usage:
		"$0 content-scan expressions update <expression-id>\n\nUpdate the Content Scanning custom expression with the given identifier and return the updated list of expressions.",
	flags: {
		payload: {
			kind: "parsed",
			brief:
				"Defines the custom content extraction expression used to reach content objects in the request.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Content Scanning custom expression to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "expression-id",
			brief:
				"Defines the unique ID for this Content Scanning custom expression.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "content-scan expressions update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["payload"] === undefined) {
						argv["payload"] = await promptForRequiredField(
							"payload",
							"Defines the custom content extraction expression used to reach content objects in the request."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf content-scan expressions update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/content-upload-scan/payloads/${argv["expression-id"] == null ? "<expression-id>" : encodeURIComponent(String(argv["expression-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"expression-id": String(argv["expression-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										payload: resolveFileToken(
											argv["payload"] as string | undefined,
											"payload",
											"text"
										),
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							expression_id: argv["expression-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					payload: resolveFileToken(
						argv["payload"] as string | undefined,
						"payload",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						expression_id: argv["expression-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
