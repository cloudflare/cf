import operation from "../../../_operations/cloudforce-one/threat-signals/feeds/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-signals feeds list\n\nLists the account's Threat Signals feed subscriptions."
		)
		.option("page", {
			type: "number",
			description: "1-based page number. Minimum 1; defaults to 1.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of feeds per page, from 1 to 100. Defaults to 20.",
		})
		.option("limit", {
			type: "number",
			description:
				"Optional 1–100 alias for per_page. When provided, limit takes precedence.",
		})
		.option("sort", {
			type: "string",
			description:
				"Sort by created_at, title, category, or url. Prefix the field with - for descending order; defaults to -created_at.",
		})
		.option("category", {
			type: "string",
			description:
				"Exact feed-category filter, up to 100 characters. Omit to include all categories.",
		})
		.option("source-type", {
			type: "string",
			description:
				"Filter by curated or custom feed source. Omit to include both source types.",
			choices: ["curated", "custom"],
		})
		.option("enabled", {
			type: "boolean",
			description:
				"Filter by enabled state. Accepts true, false, 1, or 0; omit to include enabled and disabled feeds.",
		})
		.option("status", {
			type: "string",
			description:
				"Exact stored polling-status filter, such as active or error. Omit to include every status.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Threat Signals feeds",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals feeds list",
				classification: {
					safeFlags: ["source-type", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					limit: argv["limit"],
					sort: argv["sort"],
					category: argv["category"],
					source_type: argv["source-type"],
					enabled: argv["enabled"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals feeds list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/feeds`,
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
};

export default command;
