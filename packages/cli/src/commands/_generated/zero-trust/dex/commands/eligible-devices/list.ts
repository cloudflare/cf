/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Filter devices by name or email.",
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
	describe: "List devices eligible for remote captures",
	usage:
		"$0 zero-trust dex commands eligible-devices list\n\nList devices with WARP client support for remote captures which have been connected in the last 1 hour.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
