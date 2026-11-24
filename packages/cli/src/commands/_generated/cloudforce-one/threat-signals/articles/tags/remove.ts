/**
 * remove command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "tag-id",
			brief: "UUID of a tag from the account's catalog",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "remove <tag-id>",
	describe: "Remove tag from Threat Signals article",
	usage:
		"$0 cloudforce-one threat-signals articles tags remove <tag-id>\n\nRemoves a tag from a Threat Signals article.",
	...parameters,
	loader: () => import("./remove.handler.js"),
});

export default command;
