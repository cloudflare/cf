/**
 * get command
 * @generated from apis/overlays/precursor.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cloudflare-version": {
			kind: "parsed",
			brief: "Selects the split Precursor API schema.",
			parse: String,
		},
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
	describe: "Get Zone Precursor Config",
	usage:
		"$0 precursor get\n\nRetrieve a zone's Precursor configuration: the detection `mode`, whether to `show_interstitial`, and the ordered list of `rules`.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
