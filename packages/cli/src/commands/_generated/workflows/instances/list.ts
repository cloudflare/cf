import operation from "../../_operations/workflows/instances/list.js";
/**
 * list command
 * @generated from apis/overlays/workflows.ts
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
	describe: "List of workflow instances",
	usage:
		"$0 workflows instances list\n\nLists all instances of a workflow with their execution status.",
	flags: {
		"workflow-name": { kind: "parsed", brief: "Workflow name", parse: String },
		page: {
			kind: "parsed",
			brief: "Deprecated: use `cursor` for pagination instead.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token for cursor-based pagination. Mutually exclusive with `page`.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Defines the direction for cursor-based pagination.",
			values: ["asc", "desc"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "Status",
			values: [
				"queued",
				"running",
				"paused",
				"errored",
				"terminated",
				"complete",
				"waitingForPause",
				"waiting",
				"rollingBack",
			],
			optional: true,
		},
		start: {
			kind: "parsed",
			brief: "Accepts ISO 8601 with no timezone offsets and in UTC.",
			optional: true,
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "Accepts ISO 8601 with no timezone offsets and in UTC.",
			optional: true,
			parse: String,
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
				command: "workflows instances list",
				classification: {
					safeFlags: ["direction", "status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					direction: argv["direction"],
					status: argv["status"],
					date_start: argv["start"],
					date_end: argv["end"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
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
						workflow_name: argv["workflow-name"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
