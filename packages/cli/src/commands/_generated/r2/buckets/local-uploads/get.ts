/**
 * get command
 * @generated from apis/overlays/r2.ts
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
		{ placeholder: "bucket-name", brief: "Name of the bucket.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <bucket-name>",
	describe: "Get Local Uploads Configuration",
	usage:
		"$0 r2 buckets local-uploads get <bucket-name>\n\nGets the Local Uploads configuration for an R2 bucket. When enabled, object data is written near the client before being asynchronously copied to the bucket's primary region. Local Uploads is only supported in the default jurisdiction.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
