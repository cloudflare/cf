/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		include: {
			kind: "parsed",
			brief:
				'Comma-separated list of additional information that should be included in the registration response. Supported values are: "policy".',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "registration-id", brief: "Registration ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <registration-id>",
	describe: "Get registration",
	usage:
		"$0 zero-trust devices registrations get <registration-id>\n\nFetches a single WARP registration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
