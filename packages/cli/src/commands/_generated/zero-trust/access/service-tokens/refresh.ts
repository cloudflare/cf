/**
 * refresh command
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
		{ placeholder: "service-token-id", brief: "UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "refresh <service-token-id>",
	describe: "Refresh a service token",
	usage:
		"$0 zero-trust access service-tokens refresh <service-token-id>\n\nRefreshes the expiration of a service token.",
	...parameters,
	loader: () => import("./refresh.handler.js"),
});

export default command;
