import operation from "../../../_operations/web-assets/labels/user/edit.js";
/**
 * edit command
 * @generated from apis/overlays/web-assets.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <name>",
	describe: "Edit a user-defined operation label",
	usage:
		"$0 web-assets labels user edit <name>\n\nUpdates only the supplied fields on a user-defined label.",
	flags: {
		description: {
			kind: "parsed",
			brief: "The description of the label",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Metadata for the label. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "name", brief: "The label name", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web-assets labels user edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets labels user edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/labels/user/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											metadata: parseJsonMap(argv["metadata"], "metadata"),
										},
										[["metadata"]]
									),
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
							name: argv["name"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						metadata: parseJsonMap(argv["metadata"], "metadata"),
					},
					[["metadata"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						name: argv["name"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
