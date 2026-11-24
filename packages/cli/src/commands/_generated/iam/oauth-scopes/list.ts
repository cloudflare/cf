/**
 * list command
 * @generated from apis/overlays/iam.ts
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
	command: "list",
	describe: "List OAuth Scopes",
	usage:
		"$0 iam oauth-scopes list\n\nList all available OAuth scopes. This endpoint requires authentication but has no authorization role requirements.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
