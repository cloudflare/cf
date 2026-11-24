import operation from "../_operations/zones/list.js";
/**
 * list command
 * @generated from apis/overlays/zones.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List Zones",
	usage:
		"$0 zones list\n\nLists, searches, sorts, and filters your zones. Listing zones across more than 500 accounts is currently not allowed.",
	flags: {
		name: {
			kind: "parsed",
			brief:
				"A domain name. Optional filter operators can be provided to extend refine the search:\n  * `equal` (default)\n  * `not_equal`\n  * `starts_with`\n  * `ends_with`\n  * `contains`\n  * `starts_with_case_sensitive`\n  * `ends_with_case_sensitive`\n  * `contains_case_sensitive`",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Specify a zone status to filter by.",
			values: ["initializing", "pending", "active", "moved"],
			optional: true,
		},
		type: {
			kind: "parsed",
			brief:
				'Zone types to filter by. Multiple types can be specified as a comma-separated list (e.g., ?type=full,partial,secondary). When this parameter is not provided, zones with type "internal" are excluded from the results.',
			variadic: true,
			optional: true,
			choices: ["full", "partial", "secondary", "internal"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"account-id": {
			kind: "parsed",
			brief: "Filter by an account ID.",
			optional: true,
			parse: String,
		},
		"account-name": {
			kind: "parsed",
			brief:
				"An account Name. Optional filter operators can be provided to extend refine the search:\n  * `equal` (default)\n  * `not_equal`\n  * `starts_with`\n  * `ends_with`\n  * `contains`\n  * `starts_with_case_sensitive`\n  * `ends_with_case_sensitive`\n  * `contains_case_sensitive`",
			optional: true,
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
			brief: "Number of zones per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order zones by.",
			values: ["name", "status", "account.id", "account.name", "plan.id"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order zones.",
			values: ["asc", "desc"],
			optional: true,
		},
		match: {
			kind: "enum",
			brief: "Whether to match all search requirements or at least one (any).",
			values: ["any", "all"],
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
				command: "zones list",
				classification: {
					safeFlags: ["status", "order", "direction", "match", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
