/**
 * list-zone-tags command
 * @generated from apis/overlays/rum.ts
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
	command: "list-zone-tags",
	describe: "List Web Analytics zone tags",
	usage:
		"$0 rum site-info list-zone-tags\n\nReturns all zone tags associated with Web Analytics sites for an account. These can be used to filter or exclude zones in the zone selection input. This endpoint returns all results without pagination.",
	...parameters,
	loader: () => import("./list-zone-tags.handler.js"),
});

export default command;
