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
	describe: "List Basin Catalogs",
	usage:
		"$0 basin-catalog list\n\nReturns a list of R2 buckets that have been enabled as Apache Iceberg catalogs for the specified account. Each catalog represents an R2 bucket configured to store Iceberg metadata and data files.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
