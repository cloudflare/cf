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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get build-minute availability",
	usage:
		"$0 builds limits get\n\nReturn whether the account's build-minute allowance is exhausted and when it refreshes.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
