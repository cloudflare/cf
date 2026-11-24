/**
 * list-builds command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Script tag of the Worker.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number for pagination",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "preview", brief: "ID of the Preview.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list-builds <preview>",
	describe: "List builds by preview",
	usage:
		"$0 builds previews list-builds <preview>\n\nList the builds of a single Preview with pagination.",
	...parameters,
	loader: () => import("./list-builds.handler.js"),
});

export default command;
