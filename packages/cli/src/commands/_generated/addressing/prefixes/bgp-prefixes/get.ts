import operation from "../../../_operations/addressing/prefixes/bgp-prefixes/get.js";
/**
 * get command
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
	command: "get <bgp-prefix-id>",
	describe: "Fetch BGP Prefix",
	usage:
		"$0 addressing prefixes bgp-prefixes get <bgp-prefix-id>\n\nRetrieve a single BGP Prefix according to its identifier",
	flags: {
		"prefix-id": {
			kind: "parsed",
			brief: "Identifier of an IP Prefix.",
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
			placeholder: "bgp-prefix-id",
			brief: "Identifier of BGP Prefix.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing prefixes bgp-prefixes get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing prefixes bgp-prefixes get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/prefixes/${argv["prefix-id"] == null ? "<prefix-id>" : encodeURIComponent(String(argv["prefix-id"]))}/bgp/prefixes/${argv["bgp-prefix-id"] == null ? "<bgp-prefix-id>" : encodeURIComponent(String(argv["bgp-prefix-id"]))}`,
						pathParams: {
							"prefix-id": String(argv["prefix-id"] ?? ""),
							"bgp-prefix-id": String(argv["bgp-prefix-id"] ?? ""),
						},
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
						prefix_id: argv["prefix-id"],
						bgp_prefix_id: argv["bgp-prefix-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
