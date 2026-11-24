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
	operands: [{ placeholder: "profile-id", brief: "Profile ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <profile-id>",
	describe: "Get IP profile",
	usage:
		"$0 zero-trust devices ip-profiles get <profile-id>\n\nFetches a single WARP Device IP profile.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
