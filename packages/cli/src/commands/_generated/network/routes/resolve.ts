import operation from "../../_operations/network/routes/resolve.js";
/**
 * resolve command
 * @generated from apis/overlays/network.ts
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
	command: "resolve <ip>",
	describe: "Get tunnel route by IP",
	usage:
		"$0 network routes resolve <ip>\n\nFetches routes that contain the given IP address.",
	flags: {
		"virtual-network-id": {
			kind: "parsed",
			brief: "UUID of the virtual network.",
			optional: true,
			parse: String,
		},
		"default-virtual-network-fallback": {
			kind: "boolean",
			brief:
				"When the virtual_network_id parameter is not provided the request filter will default search routes that are in the default virtual network for the account. If this parameter is set to false, the search will include routes that do not have a virtual network.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "ip", brief: "Ip", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network routes resolve",
				classification: {
					safeFlags: ["default-virtual-network-fallback", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					virtual_network_id: argv["virtual-network-id"],
					default_virtual_network_fallback:
						argv["default-virtual-network-fallback"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network routes resolve",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/teamnet/routes/ip/${argv["ip"] == null ? "<ip>" : encodeURIComponent(String(argv["ip"]))}`,
						pathParams: { ip: String(argv["ip"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						ip: argv["ip"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
