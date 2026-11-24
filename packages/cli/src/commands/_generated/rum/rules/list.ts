/**
 * list command
 * @generated from apis/overlays/rum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"ruleset-id": {
			kind: "parsed",
			brief: "The Web Analytics ruleset identifier.",
			parse: String,
		},
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
	describe: "List rules in Web Analytics ruleset",
	usage: "$0 rum rules list\n\nLists all the rules in a Web Analytics ruleset.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
