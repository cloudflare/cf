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
	operands: [
		{ placeholder: "tag-name", brief: "The name of the tag", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <tag-name>",
	describe: "Get a tag",
	usage: "$0 zero-trust access tags get <tag-name>\n\nGet a tag",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
