import operation from "../../../_operations/addressing/prefixes/bgp-prefixes/delete.js";
/**
 * delete command
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <bgp-prefix-id>",
	describe: "Delete BGP Prefix",
	usage:
		"$0 addressing prefixes bgp-prefixes delete <bgp-prefix-id>\n\nDelete a BGP Prefix associated with the specified IP Prefix. A BGP Prefix must be withdrawn before it can be deleted.",
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
				command: "addressing prefixes bgp-prefixes delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing prefixes bgp-prefixes delete",
						method: "DELETE",
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

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						prefix_id: argv["prefix-id"],
						bgp_prefix_id: argv["bgp-prefix-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
