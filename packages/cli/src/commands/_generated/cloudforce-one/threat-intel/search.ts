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
		"entity-types": {
			kind: "parsed",
			brief:
				"Entity types to search. Omit to search articles, actors, tags, events, and indicators.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"include-analytics-datasets": {
			kind: "boolean",
			brief:
				"Whether to include Event and Indicator matches from analytics datasets. Defaults to false because these datasets can take longer to search. When omitted or false, those matches are intentionally excluded and source completeness covers only the backends that were queried.",
			default: false,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of results to return. Defaults to 20.",
			default: "20",
			parse: Number,
		},
		query: {
			kind: "parsed",
			brief: "Search text, from 1 to 1000 characters after trimming.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "search",
	describe: "Search threat intelligence",
	usage:
		"$0 cloudforce-one threat-intel search\n\nSearches the articles, actors, tags, events, and indicators you can read and returns one list of typed results, most relevant first. Use `entity_types` to limit the types searched.",
	...parameters,
	loader: () => import("./search.handler.js"),
});

export default command;
