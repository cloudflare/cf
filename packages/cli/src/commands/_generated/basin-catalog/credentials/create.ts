/**
 * create command
 * @generated from apis/overlays/basin-catalog.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		token: {
			kind: "parsed",
			brief: "Provides the Cloudflare API token for accessing R2.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Contains request to store catalog credentials.",
			optional: true,
			parse: String,
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
	command: "create <bucket-name>",
	describe: "Store catalog credentials",
	usage:
		"$0 basin-catalog credentials create <bucket-name>\n\nStore authentication credentials for a catalog. These credentials are used to authenticate with R2 storage when performing catalog operations.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
