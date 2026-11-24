/**
 * check command
 * @generated from apis/overlays/images.ts
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
			placeholder: "source-id",
			brief: "Sourcing kit resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "check <source-id>",
	describe: "Get source connectivity status",
	usage:
		"$0 images import sources check <source-id>\n\nCheck whether a source can still access its S3 bucket.",
	...parameters,
	loader: () => import("./check.handler.js"),
});

export default command;
