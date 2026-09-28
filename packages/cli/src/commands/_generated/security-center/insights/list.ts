import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/security-center.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 security-center insights list\n\nLists all Security Center insights for the account or zone, showing security findings and recommendations."
		)
		.option("dismissed", { type: "boolean", description: "Dismissed" })
		.option("issue-class", { type: "string", description: "Issue class" })
		.option("issue-type", { type: "string", description: "Issue type" })
		.option("product", { type: "string", description: "Product" })
		.option("source", { type: "string", description: "Source" })
		.option("severity", { type: "string", description: "Severity" })
		.option("subject", { type: "string", description: "Subject" })
		.option("page", {
			type: "number",
			description:
				"Specifies the current page within paginated list of results.",
		})
		.option("per-page", {
			type: "number",
			description: "Sets the number of results per page of results.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"generated:get:/{account_or_zone}/{account_or_zone_id}/security-center/insights">;
type Query =
	SdkQuery<"generated:get:/{account_or_zone}/{account_or_zone_id}/security-center/insights">;

const typedBuilder = withArgTypes<
	{
		"issue-type": Query["issue_type"];
		source: Query["source"];
		severity: Query["severity"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Retrieves Security Center Insights",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-center insights list",
				classification: {
					safeFlags: ["dismissed", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					dismissed: argv["dismissed"],
					issue_class: argv["issue-class"],
					issue_type: argv["issue-type"],
					product: argv["product"],
					source: argv["source"],
					severity: argv["severity"],
					subject: argv["subject"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf security-center insights list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/security-center/insights`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				const result = await withProgress(`Loading`, async () =>
					client.securityCenter.insights.list({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
