/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"article-id": {
			kind: "parsed",
			brief: "Threat Signals article UUID",
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
	describe: "List Threat Signals article custom skills",
	usage:
		"$0 cloudforce-one threat-signals articles skills list\n\nLists active custom skills currently assigned to the article's feed and whether each has a stored output. Output content and skill configuration are retrieved separately. Free Threat Signals accounts cannot read Custom Skills.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
