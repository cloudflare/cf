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
		"identity-provider-id": { kind: "parsed", brief: "UUID.", parse: String },
		"cf-resource-id": {
			kind: "parsed",
			brief:
				'The unique Cloudflare-generated Id of the SCIM Group resource; also known as the "Id".\nPass once for a single lookup (`?cf_resource_id=A`) or repeat the parameter\n(`?cf_resource_id=A&cf_resource_id=B`) to look up multiple groups in one request,\nup to 50 values. Mutually exclusive with `idp_resource_id`, `name`,\n`search_contains`, and `search_starts_with`.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"idp-resource-id": {
			kind: "parsed",
			brief:
				'The IdP-generated Id of the SCIM Group resource; also known as the "external Id".\nPass once for a single lookup (`?idp_resource_id=A`) or repeat the parameter\n(`?idp_resource_id=A&idp_resource_id=B`) to look up multiple groups in one request,\nup to 50 values. Mutually exclusive with `cf_resource_id`, `name`,\n`search_contains`, and `search_starts_with`.',
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The display name of the SCIM Group resource.",
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
	describe: "List SCIM Group resources",
	usage:
		"$0 zero-trust identity-providers scim groups list\n\nLists SCIM Group resources synced to Cloudflare via the System for Cross-domain Identity Management (SCIM).",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
