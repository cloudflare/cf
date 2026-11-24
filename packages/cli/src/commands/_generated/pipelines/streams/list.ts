import operation from "../../_operations/pipelines/streams/list.js";
/**
 * list command
 * @generated from apis/overlays/pipelines.ts
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
	describe: "List Streams",
	usage: "$0 pipelines streams list\n\nList/Filter Streams in Account.",
	flags: {
		"pipeline-id": {
			kind: "parsed",
			brief: "Specifies the public ID of the pipeline.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Filters streams by name (case-insensitive substring).",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief: "Sorts streams by this field. Defaults to `created_at`.",
			values: ["name", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Sort direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
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
				command: "pipelines streams list",
				classification: {
					safeFlags: ["order-by", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					pipeline_id: argv["pipeline-id"],
					name: argv["name"],
					order_by: argv["order-by"],
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pipelines streams list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/v1/streams`,
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
