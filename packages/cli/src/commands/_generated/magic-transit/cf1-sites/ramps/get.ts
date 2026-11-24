/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cf1-site-id": { kind: "parsed", brief: "Identifier", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "ramp-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <ramp-id>",
	describe: "Get CF1 Site Ramp",
	usage:
		"$0 magic-transit cf1-sites ramps get <ramp-id>\n\nGets a specific ramp for a CF1 Site.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
