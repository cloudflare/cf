import operation from "../../../_operations/addressing/address-maps/ips/create.js";
/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <ip-address>",
	describe: "Add an IP to an Address Map",
	usage:
		"$0 addressing address-maps ips create <ip-address>\n\nAdd an IP from a prefix owned by the account to a particular address map.",
	flags: {
		"address-map-id": {
			kind: "parsed",
			brief: "Identifier of an Address Map.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "ip-address",
			brief: "An IPv4 or IPv6 address.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing address-maps ips create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing address-maps ips create",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/address_maps/${argv["address-map-id"] == null ? "<address-map-id>" : encodeURIComponent(String(argv["address-map-id"]))}/ips/${argv["ip-address"] == null ? "<ip-address>" : encodeURIComponent(String(argv["ip-address"]))}`,
						pathParams: {
							"address-map-id": String(argv["address-map-id"] ?? ""),
							"ip-address": String(argv["ip-address"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						account_id: accountId,
						address_map_id: argv["address-map-id"],
						ip_address: argv["ip-address"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
