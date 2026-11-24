/**
 * get command
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
				"The namespace identifier (use %1F as separator for nested namespaces).",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "table-name", brief: "The table name.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <table-name>",
	describe: "Get table maintenance configuration",
	usage:
		"$0 basin-catalog namespaces tables maintenance-configs get <table-name>\n\nRetrieve the maintenance configuration for a specific table, including compaction settings.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
