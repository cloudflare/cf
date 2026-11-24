/**
 * legacy-list command
 * @generated from apis/overlays/pipelines.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		search: {
			kind: "parsed",
			brief: "Specifies the prefix of pipeline name to search.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Specifies which page to retrieve.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Specifies the number of pipelines per page.",
			optional: true,
			parse: Number,
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
	command: "legacy-list",
	describe: "[DEPRECATED] List Pipelines",
	usage:
		"$0 pipelines legacy-list\n\n[DEPRECATED] List, filter, and paginate pipelines in an account. Use the new /pipelines/v1/pipelines endpoint instead.",
	...parameters,
	loader: () => import("./legacy-list.handler.js"),
});

export default command;
