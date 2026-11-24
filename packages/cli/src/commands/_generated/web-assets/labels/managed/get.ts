/**
 * get command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"with-mapped-resource-counts": {
			kind: "boolean",
			brief: "Include `mapped_resources` for each label",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "name", brief: "The label name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <name>",
	describe: "Get a managed operation label",
	usage:
		"$0 web-assets labels managed get <name>\n\nReturns a managed label and the web and API operations associated with it.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
