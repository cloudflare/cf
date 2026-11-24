/**
 * list command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List available regions",
	usage:
		"$0 zero-trust regions list\n\nLists the regions that the account can select for Cloudflare One. Returns an empty list if no regions are available to the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
