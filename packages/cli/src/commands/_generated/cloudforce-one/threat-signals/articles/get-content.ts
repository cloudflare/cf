/**
 * get-content command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		format: {
			kind: "enum",
			brief:
				"Response Content-Type: text (the default) for text/plain or html for text/html. Neither value converts the content. html is deprecated; use text.",
			values: ["text", "html"],
			optional: true,
		},
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
	command: "get-content <article-id>",
	describe: "Get Threat Signals article content",
	usage:
		"$0 cloudforce-one threat-signals articles get-content <article-id>\n\nRetrieves the stored content of a Threat Signals article, unchanged. Depending on how the article was captured from its source, the content is HTML, Markdown, or plain text. The format parameter sets only the response Content-Type; it does not convert the content.",
	...parameters,
	loader: () => import("./get-content.handler.js"),
});

export default command;
