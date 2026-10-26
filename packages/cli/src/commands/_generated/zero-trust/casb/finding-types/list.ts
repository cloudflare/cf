import operation from "../../../_operations/zero-trust/casb/finding-types/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
			"$0 zero-trust casb finding-types list\n\nList all available finding types with pagination support."
		)
		.option("page", {
			type: "number",
			description: "A page number within the paginated result set.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to return per page.",
		})
		.option("vendors", {
			type: "string",
			description:
				"Filter finding types by vendor. Supports multiple comma-separated values. Each value may be either the vendor enum (GOOGLE_WORKSPACE) or the friendly name returned by the read routes (Google Workspace).",
		})
		.option("types", {
			type: "string",
			description:
				"Filter finding types by category type. Supports multiple comma-separated, case-insensitive values.",
		})
		.option("origins", {
			type: "string",
			description:
				"Filter finding types by origin. Supports multiple comma-separated, case-insensitive values.",
		})
		.option("severities", {
			type: "string",
			description:
				"Filter finding types by severity. Supports multiple comma-separated, case-insensitive values.",
		})
		.option("search", {
			type: "string",
			description:
				"Filter finding types by name or ID (case-insensitive substring match).",
		})
		.option("quarantined", {
			type: "boolean",
			description:
				"When true, return only quarantined finding types; when false, return only non-quarantined finding types. Omit to return both.",
		})
		.option("min-updated-at", {
			type: "string",
			description:
				"Return only finding types updated at or after this RFC 3339 timestamp (inclusive).",
		})
		.option("max-updated-at", {
			type: "string",
			description:
				"Return only finding types updated at or before this RFC 3339 timestamp (inclusive).",
		})
		.option("order", {
			type: "string",
			description:
				"Field to sort by (case-insensitive). Defaults to 'created'.\nName and vendor sorting is case-insensitive; vendor uses friendly provider names.\nAscending order: type Content then Posture; origin custom then system;\nseverity Low, Medium, High, Critical.",
			choices: [
				"created",
				"updated",
				"match_count",
				"name",
				"vendor",
				"type",
				"origin",
				"severity",
			],
		})
		.option("direction", {
			type: "string",
			description:
				"Sort direction for the primary field. Defaults to 'desc'.\nTies are resolved by case-insensitive name, then ID, both ascending regardless of direction.",
			choices: ["asc", "desc"],
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
	describe: "List all finding types",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb finding-types list",
				classification: {
					safeFlags: ["quarantined", "order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					vendors: argv["vendors"],
					types: argv["types"],
					origins: argv["origins"],
					severities: argv["severities"],
					search: argv["search"],
					quarantined: argv["quarantined"],
					min_updated_at: argv["min-updated-at"],
					max_updated_at: argv["max-updated-at"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb finding-types list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/finding_types`,
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
