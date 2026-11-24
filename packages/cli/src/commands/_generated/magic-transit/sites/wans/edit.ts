import operation from "../../../_operations/magic-transit/sites/wans/edit.js";
/**
 * edit command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <wan-id>",
	describe: "Patch Site WAN",
	usage:
		"$0 magic-transit sites wans edit <wan-id>\n\nPatch a specific Site WAN.",
	flags: {
		"site-id": { kind: "parsed", brief: "Identifier", parse: String },
		"health-check-rate": {
			kind: "parsed",
			brief: "Magic WAN health check rate for tunnels created on this link.",
			optional: true,
			choices: ["low", "mid", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-rate", "text"),
		},
		"load-balance-inner-flows": {
			kind: "boolean",
			brief: "The load_balance_inner_flows field",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		physport: {
			kind: "parsed",
			brief: "The physport field",
			optional: true,
			parse: Number,
		},
		priority: {
			kind: "parsed",
			brief: "The priority field",
			optional: true,
			parse: Number,
		},
		"provisioned-download-kbps": {
			kind: "parsed",
			brief:
				"Provisioned download rate of the WAN circuit in kilobits per second. Set to null to remove it.",
			optional: true,
			parse: Number,
		},
		"provisioned-upload-kbps": {
			kind: "parsed",
			brief:
				"Provisioned upload rate of the WAN circuit in kilobits per second. Set to null to remove it.",
			optional: true,
			parse: Number,
		},
		"static-addressing-address": {
			kind: "parsed",
			brief: "A valid CIDR notation representing an IP range.",
			optional: true,
			parse: String,
		},
		"static-addressing-gateway-address": {
			kind: "parsed",
			brief: "A valid IPv4 address.",
			optional: true,
			parse: String,
		},
		"static-addressing-secondary-address": {
			kind: "parsed",
			brief: "A valid CIDR notation representing an IP range.",
			optional: true,
			parse: String,
		},
		"static-addressing-secondary-gateway-address": {
			kind: "parsed",
			brief:
				"Gateway address for the secondary connector of a high availability site. Set to null to remove it.",
			optional: true,
			parse: String,
		},
		"vlan-tag": {
			kind: "parsed",
			brief: "VLAN ID. Use zero for untagged.",
			optional: true,
			parse: Number,
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
	operands: [{ placeholder: "wan-id", brief: "Identifier", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites wans edit",
				classification: {
					safeFlags: [
						"health-check-rate",
						"load-balance-inner-flows",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites wans edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}/wans/${argv["wan-id"] == null ? "<wan-id>" : encodeURIComponent(String(argv["wan-id"]))}`,
						pathParams: {
							"site-id": String(argv["site-id"] ?? ""),
							"wan-id": String(argv["wan-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										health_check_rate: argv["health-check-rate"],
										load_balance_inner_flows: argv["load-balance-inner-flows"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										physport: argv["physport"],
										priority: argv["priority"],
										provisioned_download_kbps:
											argv["provisioned-download-kbps"],
										provisioned_upload_kbps: argv["provisioned-upload-kbps"],
										static_addressing: {
											address: resolveFileToken(
												argv["static-addressing-address"] as string | undefined,
												"static-addressing-address",
												"text"
											),
											gateway_address: resolveFileToken(
												argv["static-addressing-gateway-address"] as
													| string
													| undefined,
												"static-addressing-gateway-address",
												"text"
											),
											secondary_address: resolveFileToken(
												argv["static-addressing-secondary-address"] as
													| string
													| undefined,
												"static-addressing-secondary-address",
												"text"
											),
											secondary_gateway_address: resolveFileToken(
												argv["static-addressing-secondary-gateway-address"] as
													| string
													| undefined,
												"static-addressing-secondary-gateway-address",
												"text"
											),
										},
										vlan_tag: argv["vlan-tag"],
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
							site_id: argv["site-id"],
							wan_id: argv["wan-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					health_check_rate: argv["health-check-rate"],
					load_balance_inner_flows: argv["load-balance-inner-flows"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					physport: argv["physport"],
					priority: argv["priority"],
					provisioned_download_kbps: argv["provisioned-download-kbps"],
					provisioned_upload_kbps: argv["provisioned-upload-kbps"],
					static_addressing: {
						address: resolveFileToken(
							argv["static-addressing-address"] as string | undefined,
							"static-addressing-address",
							"text"
						),
						gateway_address: resolveFileToken(
							argv["static-addressing-gateway-address"] as string | undefined,
							"static-addressing-gateway-address",
							"text"
						),
						secondary_address: resolveFileToken(
							argv["static-addressing-secondary-address"] as string | undefined,
							"static-addressing-secondary-address",
							"text"
						),
						secondary_gateway_address: resolveFileToken(
							argv["static-addressing-secondary-gateway-address"] as
								| string
								| undefined,
							"static-addressing-secondary-gateway-address",
							"text"
						),
					},
					vlan_tag: argv["vlan-tag"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
						wan_id: argv["wan-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
