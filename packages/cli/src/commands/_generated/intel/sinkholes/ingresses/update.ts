import operation from "../../../_operations/intel/sinkholes/ingresses/update.js";
/**
 * update command
 * @generated from apis/overlays/intel.ts
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
	command: "update <ingress-id>",
	describe: "Update an ingress rule",
	usage:
		"$0 intel sinkholes ingresses update <ingress-id>\n\nReplaces the specified ingress rule. The sinkhole must belong to the same account as the zone.",
	flags: {
		"sinkhole-id": {
			kind: "parsed",
			brief: "The unique identifier for the sinkhole.",
			parse: String,
		},
		cidr: {
			kind: "parsed",
			brief:
				"The CIDR block for the ingress rule in IPv4 or IPv6 notation (e.g., 192.0.2.0/24). Provide a Cloudflare BYOIP CIDR that your account owns.",
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
	operands: [
		{
			placeholder: "ingress-id",
			brief: "The unique identifier for the ingress rule.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel sinkholes ingresses update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["cidr"] === undefined) {
						argv["cidr"] = await promptForRequiredField(
							"cidr",
							"The CIDR block for the ingress rule in IPv4 or IPv6 notation (e.g., 192.0.2.0/24). Provide a Cloudflare BYOIP CIDR that your account owns."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf intel sinkholes ingresses update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/intel/sinkholes/${argv["sinkhole-id"] == null ? "<sinkhole-id>" : encodeURIComponent(String(argv["sinkhole-id"]))}/ingresses/${argv["ingress-id"] == null ? "<ingress-id>" : encodeURIComponent(String(argv["ingress-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"sinkhole-id": String(argv["sinkhole-id"] ?? ""),
							"ingress-id": String(argv["ingress-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cidr: resolveFileToken(
											argv["cidr"] as string | undefined,
											"cidr",
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
							sinkhole_id: argv["sinkhole-id"],
							ingress_id: argv["ingress-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					cidr: resolveFileToken(
						argv["cidr"] as string | undefined,
						"cidr",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						sinkhole_id: argv["sinkhole-id"],
						ingress_id: argv["ingress-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
