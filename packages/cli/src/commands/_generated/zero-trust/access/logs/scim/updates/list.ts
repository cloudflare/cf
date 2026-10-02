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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access logs scim updates list\n\nLists Access SCIM update logs that maintain a record of updates made to User and Group resources synced to Cloudflare via the System for Cross-domain Identity Management (SCIM)."
		)
		.option("limit", {
			type: "number",
			description: "The maximum number of update logs to retrieve.",
		})
		.option("direction", {
			type: "string",
			description: "The chronological order used to sort the logs.",
			choices: ["desc", "asc"],
		})
		.option("since", {
			type: "string",
			description: "the timestamp of the earliest update log.",
		})
		.option("until", {
			type: "string",
			description: "the timestamp of the most-recent update log.",
		})
		.option("idp-id", {
			type: "string",
			description: "The unique Id of the IdP that has SCIM enabled.",
			demandOption: true,
		})
		.option("status", {
			type: "string",
			description: "The status of the SCIM request.",
		})
		.option("resource-type", {
			type: "string",
			description: "The resource type of the SCIM request.",
		})
		.option("request-method", {
			type: "string",
			description: "The request method of the SCIM request.",
		})
		.option("resource-user-email", {
			type: "string",
			description:
				"The email address of the SCIM User resource. Pass once for a single\nlookup (`?resource_user_email=A`) or repeat the parameter\n(`?resource_user_email=A&resource_user_email=B`) to filter by multiple\nemails in one request.",
		})
		.option("resource-group-name", {
			type: "string",
			description:
				"The display name of the SCIM Group resource. Pass once for a single\nlookup (`?resource_group_name=A`) or repeat the parameter\n(`?resource_group_name=A&resource_group_name=B`) to filter by multiple\ngroup names in one request.",
		})
		.option("cf-resource-id", {
			type: "string",
			description:
				"The unique Cloudflare-generated Id of the SCIM resource. Pass once for\na single lookup (`?cf_resource_id=A`) or repeat the parameter\n(`?cf_resource_id=A&cf_resource_id=B`) to filter by multiple resources\nin one request.",
		})
		.option("idp-resource-id", {
			type: "string",
			description:
				"The IdP-generated Id of the SCIM resource. Pass once for a single\nlookup (`?idp_resource_id=A`) or repeat the parameter\n(`?idp_resource_id=A&idp_resource_id=B`) to filter by multiple\nresources in one request.",
		})
		.option("page", { type: "number", description: "Page number of results." })
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"access-scim-update-logs-list-access-scim-update-logs">;
type Query = SdkQuery<"access-scim-update-logs-list-access-scim-update-logs">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		status: Query["status"];
		"resource-type": Query["resource_type"];
		"request-method": Query["request_method"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Access SCIM update logs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access logs scim updates list",
				classification: {
					safeFlags: ["direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					limit: argv["limit"],
					direction: argv["direction"],
					since: argv["since"],
					until: argv["until"],
					idp_id: argv["idp-id"],
					status: argv["status"],
					resource_type: argv["resource-type"],
					request_method: argv["request-method"],
					resource_user_email: argv["resource-user-email"],
					resource_group_name: argv["resource-group-name"],
					cf_resource_id: argv["cf-resource-id"],
					idp_resource_id: argv["idp-resource-id"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access logs scim updates list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/logs/scim/updates`,
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
					client.zeroTrust.access.logs.scim.updates.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
