/**
 * list command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page",
			optional: true,
			parse: Number,
		},
		"page-no": {
			kind: "parsed",
			brief:
				"The page number from which you want your page search results to be displayed.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search presets by name.",
			optional: true,
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
	command: "list",
	describe: "Fetch all presets",
	usage:
		"$0 realtime kit presets list\n\nFetches all the presets belonging to an App.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
