import operation from "../../_operations/network-interconnects/cnis/list.js";
/**
 * list command
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
	command: "list",
	describe: "List existing CNI objects",
	usage:
		"$0 network-interconnects cnis list\n\nLists all Cloud Network Interconnects (CNIs) configured for the account, showing connection status and parameters.",
	flags: {
		slot: {
			kind: "parsed",
			brief: "If specified, only show CNIs associated with the specified slot",
			optional: true,
			parse: String,
		},
		"tunnel-id": {
			kind: "parsed",
			brief:
				"If specified, only show cnis associated with the specified tunnel id",
			optional: true,
			parse: String,
		},
		cursor: { kind: "parsed", brief: "Cursor", optional: true, parse: Number },
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects cnis list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					slot: argv["slot"],
					tunnel_id: argv["tunnel-id"],
					cursor: argv["cursor"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network-interconnects cnis list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/cnis`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
