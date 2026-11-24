/**
 * update command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief: "Whether to enable local uploads for this bucket.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "bucket-name", brief: "Name of the bucket.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <bucket-name>",
	describe: "Set Local Uploads Configuration",
	usage:
		"$0 r2 buckets local-uploads update <bucket-name>\n\nEnables or disables Local Uploads for an R2 bucket in the default jurisdiction. When enabled, object data is written near the client before being asynchronously copied to the bucket's primary region. Disabling Local Uploads allows existing replication to finish.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
