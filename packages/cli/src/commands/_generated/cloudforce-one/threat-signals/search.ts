/**
 * search command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		query: {
			kind: "parsed",
			brief:
				"Keyword and semantic article-search text, from 1 to 1000 characters.",
			parse: String,
		},
		"max-results": {
			kind: "parsed",
			brief:
				"Maximum search matches to request, an integer from 1 to 50. Defaults to 20 when omitted or empty; multiple matches from one article can produce fewer returned articles.",
			optional: true,
			parse: String,
		},
		"feed-id": {
			kind: "parsed",
			brief:
				"Optional feed UUID that restricts results to articles from that feed.",
			optional: true,
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
	command: "search",
	describe: "Search Threat Signals articles using AI Search",
	usage:
		"$0 cloudforce-one threat-signals search\n\nSearches the account's Threat Signals articles using keyword and semantic retrieval.",
	...parameters,
	loader: () => import("./search.handler.js"),
});

export default command;
