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
		"user-id": { kind: "parsed", brief: "UUID.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "nonce", brief: "Nonce", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <nonce>",
	describe: "Get single active session",
	usage:
		"$0 zero-trust access users active-sessions get <nonce>\n\nGet an active session for a single user.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
