/**
 * delete command
 * @generated from apis/overlays/basin-catalog.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cascade: {
			kind: "boolean",
			brief: "Remove child metadata before deleting the catalog.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "bucket-name",
			brief: "Specifies the R2 bucket name.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <bucket-name>",
	describe: "Delete Basin Catalog metadata",
	usage:
		"$0 basin-catalog delete <bucket-name>\n\nRemoves the catalog from the control plane without deleting R2 bucket objects. Set force=true to remove catalog namespaces, tables, views, and maintenance metadata. Force deletion is limited to a configured catalog object count.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
