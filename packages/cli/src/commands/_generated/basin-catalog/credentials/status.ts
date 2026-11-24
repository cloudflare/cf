/**
 * status command
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
	command: "status <bucket-name>",
	describe: "Get Basin Catalog credential status",
	usage:
		"$0 basin-catalog credentials status <bucket-name>\n\nCheck whether the configured catalog credentials are valid, invalid, or absent by probing authentication against the catalog.",
	...parameters,
	loader: () => import("./status.handler.js"),
});

export default command;
