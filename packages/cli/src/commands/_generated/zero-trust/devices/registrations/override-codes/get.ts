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
	describe: "Get override codes",
	usage:
		"$0 zero-trust devices registrations override-codes get <registration-id>\n\nFetches one-time use admin override codes for a registration. This relies on the **Admin Override** setting being enabled in your device configuration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
