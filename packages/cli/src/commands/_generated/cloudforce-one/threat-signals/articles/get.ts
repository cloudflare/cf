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
			placeholder: "article-id",
			brief: "Threat Signals article UUID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <article-id>",
	describe: "Get Threat Signals article",
	usage:
		"$0 cloudforce-one threat-signals articles get <article-id>\n\nRetrieves a Threat Signals article with its summary, tags, indicator status and relevance to the account's Priority Intelligence Requirements.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
