import operation from "../../../_operations/web-assets/operations/labels/bulk-delete.js";
/**
 * bulk-delete command
 * @generated from apis/overlays/web-assets.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "bulk-delete",
	describe: "Remove labels from web or API operations",
	usage:
		"$0 web-assets operations labels bulk-delete\n\nRemoves labels from multiple web or API operations in one request.",
	flags: {
		"managed-labels": {
			kind: "parsed",
			brief: "List of managed label names.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"user-labels": {
			kind: "parsed",
			brief: "List of user label names.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
				command: "web-assets operations labels bulk-delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets operations labels bulk-delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/operations/labels`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										managed: {
											labels: argv["managed-labels"],
										},
										user: {
											labels: argv["user-labels"],
										},
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

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation removes the selected labels from the selected web and API operations.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Deleting`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					managed: {
						labels: argv["managed-labels"],
					},
					user: {
						labels: argv["user-labels"],
					},
				});
				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
