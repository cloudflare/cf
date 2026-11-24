import operation from "../../_operations/network-interconnects/interconnects/list.js";
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
	describe: "List existing interconnects",
	usage:
		"$0 network-interconnects interconnects list\n\nLists network interconnects of a single type configured for the account. The `type` query parameter selects the type to list; when omitted, only `direct` interconnects are returned.",
	flags: {
		site: {
			kind: "parsed",
			brief: "If specified, only show interconnects located at the given site",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"Type of interconnect to list, such as `direct` or `gcp_partner`. Defaults to `direct`.",
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
				command: "network-interconnects interconnects list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					site: argv["site"],
					type: argv["type"],
					cursor: argv["cursor"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network-interconnects interconnects list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/interconnects`,
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
