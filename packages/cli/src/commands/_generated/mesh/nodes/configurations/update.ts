import operation from "../../../_operations/mesh/nodes/configurations/update.js";
/**
 * update command
 * @generated from apis/overlays/mesh.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <tunnel-id>",
	describe: "Update Mesh node HA configuration",
	usage:
		"$0 mesh nodes configurations update <tunnel-id>\n\nAdds or updates the high-availability configuration for a Mesh node.",
	flags: {
		"mesh-config-fnr-id": {
			kind: "parsed",
			brief:
				"Floating Network Resource ID — the secondary ENI that is moved between nodes on failover.",
			optional: true,
			parse: String,
		},
		"mesh-config-vips": {
			kind: "parsed",
			brief:
				'VIPs to assign on the CloudflareWARP interface. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"address": string}].',
			optional: true,
			parse: String,
		},
		"mesh-config-vips-previous": {
			kind: "parsed",
			brief:
				'VIPs to clean up on demotion or version drift. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"address": string}].',
			optional: true,
			parse: String,
		},
		"ha-mode": {
			kind: "parsed",
			brief:
				"High-availability mode for the Mesh node. `none` means HA is enabled but no provider is configured yet (newly created nodes default to this). `disabled` means HA is explicitly turned off. `aws` uses AWS ENI move for failover. `local` uses virtual IPs (VIPs) on the local interface.",
			optional: true,
			choices: ["none", "disabled", "aws", "local"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "ha-mode", "text"),
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
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
	rules(rules) {
		rules.conflicts("mesh-config-fnr-id", [
			"mesh-config-vips",
			"mesh-config-vips-previous",
		]);
		rules.conflicts("mesh-config-vips", ["mesh-config-fnr-id"]);
		rules.conflicts("mesh-config-vips-previous", ["mesh-config-fnr-id"]);
		rules.implies("mesh-config-vips-previous", ["mesh-config-vips"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mesh nodes configurations update",
				classification: {
					safeFlags: ["ha-mode", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["ha-mode"] === undefined) {
						argv["ha-mode"] = await promptForRequiredEnumField(
							"ha-mode",
							"High-availability mode for the Mesh node. \`none\` means HA is enabled but no provider is configured yet (newly created nodes default to this). \`disabled\` means HA is explicitly turned off. \`aws\` uses AWS ENI move for failover. \`local\` uses virtual IPs (VIPs) on the local interface.",
							["none", "disabled", "aws", "local"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mesh nodes configurations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/warp_connector/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/configurations`,
						pathParams: { "tunnel-id": String(argv["tunnel-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											fnr_id: resolveFileToken(
												argv["mesh-config-fnr-id"] as string | undefined,
												"mesh-config-fnr-id",
												"text"
											),
											vips: parseObjectArray(
												argv["mesh-config-vips"],
												"mesh-config-vips"
											),
											vips_previous: parseObjectArray(
												argv["mesh-config-vips-previous"],
												"mesh-config-vips-previous"
											),
										},
										ha_mode: argv["ha-mode"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							tunnel_id: argv["tunnel-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					config: {
						fnr_id: resolveFileToken(
							argv["mesh-config-fnr-id"] as string | undefined,
							"mesh-config-fnr-id",
							"text"
						),
						vips: parseObjectArray(
							argv["mesh-config-vips"],
							"mesh-config-vips"
						),
						vips_previous: parseObjectArray(
							argv["mesh-config-vips-previous"],
							"mesh-config-vips-previous"
						),
					},
					ha_mode: argv["ha-mode"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						tunnel_id: argv["tunnel-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
