import operation from "../../../../../_operations/zero-trust/access/logs/scim/updates/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
	describe: "List Access SCIM update logs",
	usage:
		"$0 zero-trust access logs scim updates list\n\nLists Access SCIM update logs that maintain a record of updates made to User and Group resources synced to Cloudflare via the System for Cross-domain Identity Management (SCIM).",
	flags: {
		limit: {
			kind: "parsed",
			brief: "The maximum number of update logs to retrieve.",
			optional: true,
			parse: Number,
		},
		direction: {
			kind: "enum",
			brief: "The chronological order used to sort the logs.",
			values: ["desc", "asc"],
			optional: true,
		},
		since: {
			kind: "parsed",
			brief: "the timestamp of the earliest update log.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief: "the timestamp of the most-recent update log.",
			optional: true,
			parse: String,
		},
		"idp-id": {
			kind: "parsed",
			brief: "The unique Id of the IdP that has SCIM enabled.",
			variadic: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief: "The status of the SCIM request.",
			variadic: true,
			optional: true,
			choices: ["FAILURE", "SUCCESS"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"resource-type": {
			kind: "parsed",
			brief: "The resource type of the SCIM request.",
			variadic: true,
			optional: true,
			choices: ["USER", "GROUP"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"request-method": {
			kind: "parsed",
			brief: "The request method of the SCIM request.",
			variadic: true,
			optional: true,
			choices: ["DELETE", "PATCH", "POST", "PUT"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"resource-user-email": {
			kind: "parsed",
			brief:
				"The email address of the SCIM User resource. Pass once for a single\nlookup (`?resource_user_email=A`) or repeat the parameter\n(`?resource_user_email=A&resource_user_email=B`) to filter by multiple\nemails in one request.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"resource-group-name": {
			kind: "parsed",
			brief:
				"The display name of the SCIM Group resource. Pass once for a single\nlookup (`?resource_group_name=A`) or repeat the parameter\n(`?resource_group_name=A&resource_group_name=B`) to filter by multiple\ngroup names in one request.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"cf-resource-id": {
			kind: "parsed",
			brief:
				"The unique Cloudflare-generated Id of the SCIM resource. Pass once for\na single lookup (`?cf_resource_id=A`) or repeat the parameter\n(`?cf_resource_id=A&cf_resource_id=B`) to filter by multiple resources\nin one request.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"idp-resource-id": {
			kind: "parsed",
			brief:
				"The IdP-generated Id of the SCIM resource. Pass once for a single\nlookup (`?idp_resource_id=A`) or repeat the parameter\n(`?idp_resource_id=A&idp_resource_id=B`) to filter by multiple\nresources in one request.",
			variadic: true,
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
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
				command: "zero-trust access logs scim updates list",
				classification: {
					safeFlags: ["direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
