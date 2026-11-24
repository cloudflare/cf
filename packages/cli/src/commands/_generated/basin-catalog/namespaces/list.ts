/**
 * list command
 * @generated from apis/overlays/basin-catalog.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Specifies the R2 bucket name.",
			parse: String,
		},
		"page-token": {
			kind: "parsed",
			brief:
				"Opaque pagination token from a previous response.\nUse this to fetch the next page of results.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief:
				"Maximum number of namespaces to return per page.\nDefaults to 100, maximum 1000.",
			optional: true,
			parse: Number,
		},
		parent: {
			kind: "parsed",
			brief:
				'Parent namespace to filter by. Only returns direct children of this namespace.\nFor nested namespaces, use %1F as separator (e.g., "bronze%1Fanalytics").\nOmit this parameter to list top-level namespaces.',
			optional: true,
			parse: String,
		},
		"return-uuids": {
			kind: "boolean",
			brief:
				"Whether to include namespace UUIDs in the response.\nSet to true to receive the namespace_uuids array.",
			optional: true,
		},
		"return-details": {
			kind: "boolean",
			brief:
				"Whether to include additional metadata (timestamps).\nWhen true, response includes created_at and updated_at arrays.",
			optional: true,
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
	describe: "List namespaces in catalog",
	usage:
		"$0 basin-catalog namespaces list\n\nReturns a list of namespaces in the specified Basin Catalog. Supports hierarchical filtering and pagination for efficient traversal of large namespace hierarchies.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
