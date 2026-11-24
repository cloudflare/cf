import operation from "../../_operations/network-interconnects/interconnects/loa-default-name.js";
/**
 * loa-default-name command
 * @generated from apis/overlays/network-interconnects.ts
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
	command: "loa-default-name <icon>",
	describe: "Get the default customer name for LOA generation",
	usage:
		"$0 network-interconnects interconnects loa-default-name <icon>\n\nRetrieves the default customer name that will be used in the LOA if no name is provided to the `/accounts/{account_id}/cni/interconnects/{icon}/loa` endpoint.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "icon",
			brief: "Interconnect name to retrieve information about",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects interconnects loa-default-name",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network-interconnects interconnects loa-default-name",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/interconnects/${argv["icon"] == null ? "<icon>" : encodeURIComponent(String(argv["icon"]))}/loa/default`,
						pathParams: { icon: String(argv["icon"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, icon: argv["icon"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
