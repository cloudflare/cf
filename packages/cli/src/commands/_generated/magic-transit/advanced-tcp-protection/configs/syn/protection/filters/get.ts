import operation from "../../../../../../_operations/magic-transit/advanced-tcp-protection/configs/syn/protection/filters/get.js";
/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
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
	command: "get <filter-id>",
	describe: "Get SYN Protection filter.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs syn protection filters get <filter-id>\n\nGet a SYN Protection filter specified by the given UUID.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "filter-id",
			brief: "The UUID of the filter to retrieve.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs syn protection filters get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-tcp-protection configs syn protection filters get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/syn_protection/filters/${argv["filter-id"] == null ? "<filter-id>" : encodeURIComponent(String(argv["filter-id"]))}`,
						pathParams: { "filter-id": String(argv["filter-id"] ?? "") },
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
						filter_id: argv["filter-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
