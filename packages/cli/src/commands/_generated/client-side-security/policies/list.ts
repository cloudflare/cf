/**
 * list command
 * @generated from apis/overlays/client-side-security.ts
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
	describe: "List content security rules",
	usage:
		"$0 client-side-security policies list\n\nLists content security rules configured for the zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
