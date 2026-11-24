import operation from "../../../_operations/organizations/billing/usage/get.js";
/**
 * get command
 * @generated from apis/overlays/organizations.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <organization-id>",
	describe: "Get Organization Usage (Version 2, Alpha, Restricted)",
	usage:
		"$0 organizations billing usage get <organization-id>\n\nReturns cost and usage data for all accounts within an organization, aligned with the [FinOps FOCUS v1.3](https://focus.finops.org/focus-specification/v1-3/) Cost and Usage dataset specification. Each record represents one billable metric for one account on one day. This includes all metered usage, including usage that falls within free-tier allowances and may result in zero cost. The response includes usage for every account belonging to the specified organization. **Note:** This endpoint serves `usage` records only; cost and pricing fields are absent from responses. Rated costs are available per account via `POST /accounts/{account_id}/billable/usage` with `Metric: cost`. When `from` and `to` are omitted, defaults to the start of the current month through today. The maximum date range is 31 days. An organization with no accounts, or an organization ID that does not exist, returns a successful response with an empty result set rather than an error.",
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Start date for the usage query (ISO 8601). Required if `to` is set. When omitted along with `to`, defaults to the start of the current month. Filters by charge period (when consumption happened), not billing period. The maximum date range is 31 days.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"End date for the usage query (ISO 8601). Required if `from` is set. When omitted along with `from`, defaults to today. Filters by charge period (when consumption happened), not billing period. The maximum date range is 31 days.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "organization-id",
			brief: "Identifies the Cloudflare organization.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organizations billing usage get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					from: argv["from"],
					to: argv["to"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organizations billing usage get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/billable/usage`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						organization_id: argv["organization-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
