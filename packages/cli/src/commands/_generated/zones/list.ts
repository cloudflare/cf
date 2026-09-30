import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zones.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zones list\n\nLists, searches, sorts, and filters your zones. Listing zones across more than 500 accounts is currently not allowed."
		)
		.option("name", {
			type: "string",
			description:
				"A domain name. Optional filter operators can be provided to extend refine the search:\n  * `equal` (default)\n  * `not_equal`\n  * `starts_with`\n  * `ends_with`\n  * `contains`\n  * `starts_with_case_sensitive`\n  * `ends_with_case_sensitive`\n  * `contains_case_sensitive`",
		})
		.option("status", {
			type: "string",
			description: "Specify a zone status to filter by.",
			choices: ["initializing", "pending", "active", "moved"],
		})
		.option("type", {
			type: "string",
			description:
				'Zone types to filter by. Multiple types can be specified as a comma-separated list (e.g., ?type=full,partial,secondary). When this parameter is not provided, zones with type "internal" are excluded from the results.',
		})
		.option("account-id", {
			type: "string",
			description: "Filter by an account ID.",
		})
		.option("account-name", {
			type: "string",
			description:
				"An account Name. Optional filter operators can be provided to extend refine the search:\n  * `equal` (default)\n  * `not_equal`\n  * `starts_with`\n  * `ends_with`\n  * `contains`\n  * `starts_with_case_sensitive`\n  * `ends_with_case_sensitive`\n  * `contains_case_sensitive`",
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of zones per page.",
		})
		.option("order", {
			type: "string",
			description: "Field to order zones by.",
			choices: ["name", "status", "account.id", "account.name", "plan.id"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order zones.",
			choices: ["asc", "desc"],
		})
		.option("match", {
			type: "string",
			description:
				"Whether to match all search requirements or at least one (any).",
			choices: ["any", "all"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Query = SdkQuery<"zones-get">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
		type: Query["type"];
		order: Query["order"];
		direction: Query["direction"];
		match: Query["match"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Zones",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones list",
				classification: {
					safeFlags: ["status", "order", "direction", "match", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					name: argv["name"],
					status: argv["status"],
					type: argv["type"],
					"account.id": argv["account-id"],
					"account.name": argv["account-name"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					match: argv["match"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.zones.list(queryParams)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
