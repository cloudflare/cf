/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Access SCIM update logs",
	usage:
		"$0 zero-trust access logs scim updates list\n\nLists Access SCIM update logs that maintain a record of updates made to User and Group resources synced to Cloudflare via the System for Cross-domain Identity Management (SCIM).",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
