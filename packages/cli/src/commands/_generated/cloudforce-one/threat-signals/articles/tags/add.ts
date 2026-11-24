/**
 * add command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tag-id": {
			kind: "parsed",
			brief:
				"UUID of a tag from the account's catalog to apply to the article.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "article-id",
			brief: "Threat Signals article UUID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "add <article-id>",
	describe: "Add tag to Threat Signals article",
	usage:
		"$0 cloudforce-one threat-signals articles tags add <article-id>\n\nApplies a tag from the account's tag catalog to a Threat Signals article.",
	...parameters,
	loader: () => import("./add.handler.js"),
});

export default command;
