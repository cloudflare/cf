import operation from "../../../_operations/iam/user-groups/members/list.js";
/**
 * list command
 * @generated from apis/overlays/iam.ts
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
	describe: "List User Group Members",
	usage:
		"$0 iam user-groups members list\n\nList all the members attached to a user group.",
	flags: {
		"user-group-id": {
			kind: "parsed",
			brief: "User Group identifier tag.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		"fuzzy-email": {
			kind: "parsed",
			brief: "A string used for filtering members by partial email match.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "The sort order of returned user group members by email.",
			values: ["asc", "desc"],
			optional: true,
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
				command: "iam user-groups members list",
				classification: {
					safeFlags: ["direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					fuzzyEmail: argv["fuzzy-email"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf iam user-groups members list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/iam/user_groups/${argv["user-group-id"] == null ? "<user-group-id>" : encodeURIComponent(String(argv["user-group-id"]))}/members`,
						pathParams: {
							"user-group-id": String(argv["user-group-id"] ?? ""),
						},
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
						user_group_id: argv["user-group-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
