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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
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
	command: "get <bucket-name>",
	describe: "Get Basin Catalog details",
	usage:
		"$0 basin-catalog get <bucket-name>\n\nRetrieve detailed information about a specific Basin Catalog by bucket name. Returns catalog status, maintenance configuration, and credential status.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
