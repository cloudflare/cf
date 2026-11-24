import operation from "../../_operations/tunnels/hostnames/list.js";
/**
 * list command
 * @generated from apis/overlays/tunnels.ts
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
	describe: "List tunnel hostnames",
	usage:
		"$0 tunnels hostnames list\n\nLists and filters the hostnames assigned to a tunnel.",
	flags: {
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief:
				"If set, only list tunnel hostnames that contain this value. The filter is case-insensitive.",
			optional: true,
			parse: String,
		},
		canonical: {
			kind: "boolean",
			brief:
				"If set, only list tunnel hostnames with the specified canonical status.",
			optional: true,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only return deleted tunnel hostnames. If `false` or omitted, exclude deleted tunnel hostnames.",
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of results to display, up to 1000. The server caps larger values at 1000.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number to return.",
			optional: true,
			parse: Number,
		},
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
				command: "tunnels hostnames list",
				classification: {
					safeFlags: ["canonical", "is-deleted", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					hostname: argv["hostname"],
					canonical: argv["canonical"],
					is_deleted: argv["is-deleted"],
					per_page: argv["per-page"],
					page: argv["page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf tunnels hostnames list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/tunnels/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/hostnames`,
						pathParams: { "tunnel-id": String(argv["tunnel-id"] ?? "") },
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
						tunnel_id: argv["tunnel-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
