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
		namespace: {
			kind: "parsed",
			brief:
				'The namespace identifier.\nFor nested namespaces, use %1F as separator (e.g., "bronze%1Fanalytics").',
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
				"Maximum number of tables to return per page.\nDefaults to 100, maximum 1000.",
			optional: true,
			parse: Number,
		},
		"return-uuids": {
			kind: "boolean",
			brief:
				"Whether to include table UUIDs in the response.\nSet to true to receive the table_uuids array.",
			optional: true,
		},
		"return-details": {
			kind: "boolean",
			brief:
				"Whether to include additional metadata (timestamps, locations).\nWhen true, response includes created_at, updated_at, metadata_locations, and locations arrays.",
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
	describe: "List tables in namespace",
	usage:
		"$0 basin-catalog namespaces tables list\n\nReturns a list of tables in the specified namespace within a Basin Catalog. Supports pagination for efficient traversal of large table collections.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
