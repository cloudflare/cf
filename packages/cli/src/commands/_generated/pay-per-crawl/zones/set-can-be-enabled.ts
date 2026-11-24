/**
 * set-can-be-enabled command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		zones: {
			kind: "parsed",
			brief:
				'The zones field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string, "can_be_enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Data for setting flag on zones",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "set-can-be-enabled",
	describe: "Set can_be_enabled setting on zones",
	usage:
		"$0 pay-per-crawl zones set-can-be-enabled\n\nAllows an account admin to set the can_be_enabled setting on a list of zones. An omitted can_be_enabled value leaves that zone unchanged.",
	...parameters,
	loader: () => import("./set-can-be-enabled.handler.js"),
});

export default command;
