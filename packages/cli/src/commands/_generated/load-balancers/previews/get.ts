/**
 * get command
 * @generated from apis/overlays/load-balancers.ts
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
	operands: [{ placeholder: "preview-id", brief: "Preview ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <preview-id>",
	describe: "Preview Result",
	usage:
		"$0 load-balancers previews get <preview-id>\n\nGet the result of a previous preview operation using the provided preview_id.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
