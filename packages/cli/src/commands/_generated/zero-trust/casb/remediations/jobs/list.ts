import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
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
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb remediations jobs list\n\nList all remediation jobs tied to a specific Cloudflare Account. Note that `cursor` and `page` are mutually exclusive."
		)
		.option("cursor", {
			type: "string",
			description: "A cursor for pagination.",
		})
		.option("page", {
			type: "number",
			description: "A page number within the paginated result set.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to return per page.",
		})
		.option("search", { type: "string", description: "A search term." })
		.option("min-updated-at", {
			type: "string",
			description:
				"Filter to view remediations updated on or after the min updated datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
		})
		.option("max-updated-at", {
			type: "string",
			description:
				"Filter to view remediations updated on or before the max updated datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
		})
		.option("status", {
			type: "string",
			description: "Filter to view remediations with the given status.",
			choices: ["pending", "processing", "completed", "failed", "validating"],
		})
		.option("triggered-by-actor", {
			type: "string",
			description:
				"Filter remediations by what kind of actor triggered them. Supports multiple comma-separated values.",
		})
		.option("integration-id", {
			type: "string",
			description: "Filter by an integration ID",
		})
		.option("order", {
			type: "string",
			description: "An optional param to sort the results by the given field.",
			choices: [
				"created_at",
				"affliction_date",
				"integration_name",
				"status",
				"last_updated_at",
				"asset_name",
				"finding_type_name",
			],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order results.",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"ListRemediationJobs">;
type Query = SdkQuery<"ListRemediationJobs">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
		"triggered-by-actor": Query["triggered_by_actor"];
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List remediation jobs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb remediations jobs list",
				classification: {
					safeFlags: ["status", "order", "direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					cursor: argv["cursor"],
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					min_updated_at: argv["min-updated-at"],
					max_updated_at: argv["max-updated-at"],
					status: argv["status"],
					triggered_by_actor: argv["triggered-by-actor"],
					integration_id: argv["integration-id"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb remediations jobs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/remediations/jobs`,
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
					client.zeroTrust.casb.remediations.jobs.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
