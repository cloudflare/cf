/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
		{
			placeholder: "id",
			brief: "The unique identifier for the rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <id>",
	describe: "Get a rule",
	usage: "$0 cloudforce-one rules get <id>\n\nGet a single rule by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
