/**
 * get command
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
	command: "get <preview>",
	describe: "Get preview",
	usage:
		"$0 builds previews get <preview>\n\nRetrieve a single Preview of a Worker, including the build settings it currently uses.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
