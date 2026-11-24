/**
 * get command
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
	operands: [{ placeholder: "variant-id", brief: "Variant ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <variant-id>",
	describe: "Variant details",
	usage:
		"$0 images variants get <variant-id>\n\nFetch details for a CF Images variant.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
