/**
 * list command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"share-id": {
			kind: "parsed",
			brief: "Share identifier tag.",
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter share resources by status.",
			values: ["active", "deleting", "deleted"],
			optional: true,
		},
		"resource-type": {
			kind: "enum",
			brief: "Filter share resources by resource_type.",
			values: [
				"custom-ruleset",
				"gateway-policy",
				"gateway-destination-ip",
				"gateway-block-page-settings",
				"gateway-extended-email-matching",
				"idp-federation-grant",
				"trust-grant",
			],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number. Defaults to `1` when omitted.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of objects to return per page. Defaults to `20` when omitted.",
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
	describe: "List share resources by share ID",
	usage:
		"$0 resource-sharing resources list\n\nList share resources by share ID.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
