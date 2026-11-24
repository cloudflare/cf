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
		namespace: { kind: "parsed", brief: "Namespace", parse: String },
		"table-name": { kind: "parsed", brief: "Table name", parse: String },
		"page-size": {
			kind: "parsed",
			brief: "Page size",
			optional: true,
			parse: Number,
		},
		"page-token": {
			kind: "parsed",
			brief: "Page token",
			optional: true,
			parse: String,
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
	describe: "List table maintenance runs",
	usage:
		"$0 basin-catalog namespaces tables maintenance-runs list\n\nRetrieves recent table maintenance runs for the current table.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
