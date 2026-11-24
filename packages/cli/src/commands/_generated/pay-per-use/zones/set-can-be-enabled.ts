/**
 * set-can-be-enabled command
 * @generated from apis/overlays/pay-per-use.ts
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
			brief: "Pay-per-use zone eligibility updates",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "set-can-be-enabled",
	describe: "Set pay-per-use zone eligibility",
	usage:
		"$0 pay-per-use zones set-can-be-enabled\n\nSets pay-per-use eligibility for a list of account zones. An omitted can_be_enabled value leaves that zone unchanged. Revoking eligibility disables the zone immediately while existing accepted licenses remain active until the start of the next UTC month.",
	...parameters,
	loader: () => import("./set-can-be-enabled.handler.js"),
});

export default command;
