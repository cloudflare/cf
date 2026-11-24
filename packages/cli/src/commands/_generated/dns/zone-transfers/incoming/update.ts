import operation from "../../../_operations/dns/zone-transfers/incoming/update.js";
/**
 * update command
 * @generated from apis/overlays/dns.ts
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
	command: "update",
	describe: "Update Secondary Zone Configuration",
	usage:
		"$0 dns zone-transfers incoming update\n\nUpdate secondary zone configuration for incoming zone transfers.",
	flags: {
		"auto-refresh-seconds": {
			kind: "parsed",
			brief:
				"How often should a secondary zone auto refresh regardless of DNS NOTIFY.\nNot applicable for primary zones.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "Zone name.",
			optional: true,
			parse: String,
		},
		peers: {
			kind: "parsed",
			brief: "A list of peer tags.",
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
				command: "dns zone-transfers incoming update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["auto-refresh-seconds"] === undefined) {
						throw new Error(
							"--auto-refresh-seconds is required (or pass --body with this field set)."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField("name", "Zone name.");
					}
					if (argv["peers"] === undefined) {
						throw new Error(
							"--peers is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf dns zone-transfers incoming update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/secondary_dns/incoming`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										auto_refresh_seconds: argv["auto-refresh-seconds"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										peers: argv["peers"],
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
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					auto_refresh_seconds: argv["auto-refresh-seconds"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					peers: argv["peers"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
