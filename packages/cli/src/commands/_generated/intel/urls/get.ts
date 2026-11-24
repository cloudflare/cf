/**
 * get command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		url: { kind: "parsed", brief: "The URL to look up.", parse: String },
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
	command: "get",
	describe: "Get URL Intelligence",
	usage:
		"$0 intel urls get\n\nGets security information about a URL, including content categories and risk types. The URL must be provided as a query parameter.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
