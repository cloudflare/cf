import operation from "../_operations/zones/edit.js";
/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit",
	describe: "Edit Zone",
	usage:
		"$0 zones edit\n\nEdits a zone. Only one zone property can be changed at a time.",
	flags: {
		paused: {
			kind: "boolean",
			brief:
				"Indicates whether the zone is only using Cloudflare DNS services. A\ntrue value means the zone will not receive security or performance\nbenefits.\n",
			optional: true,
		},
		"plan-id": {
			kind: "parsed",
			brief: "Identifier",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"A full zone implies that DNS is hosted with Cloudflare. A partial\nzone is typically a partner-hosted zone or a CNAME setup. This\nparameter is only available to Enterprise customers or if it has\nbeen explicitly enabled on a zone.\n",
			optional: true,
			choices: ["full", "partial", "secondary", "internal"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"vanity-name-servers": {
			kind: "parsed",
			brief:
				"An array of domains used for custom name servers. This is only\navailable for Business and Enterprise plans.",
			variadic: true,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones edit",
				classification: {
					safeFlags: ["paused", "type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										paused: argv["paused"],
										plan: {
											id: resolveFileToken(
												argv["plan-id"] as string | undefined,
												"plan-id",
												"text"
											),
										},
										type: argv["type"],
										vanity_name_servers: argv["vanity-name-servers"],
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
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					paused: argv["paused"],
					plan: {
						id: resolveFileToken(
							argv["plan-id"] as string | undefined,
							"plan-id",
							"text"
						),
					},
					type: argv["type"],
					vanity_name_servers: argv["vanity-name-servers"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
