/**
 * websearch command
 * @generated from apis/overlays/ai.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"byok-alias": {
			kind: "parsed",
			brief: "The byokAlias field",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "The limit field",
			optional: true,
			parse: Number,
		},
		"options-gateway-id": {
			kind: "parsed",
			brief: "The options.gateway.id field",
			optional: true,
			parse: String,
		},
		provider: {
			kind: "parsed",
			brief: "The provider field",
			optional: true,
			parse: String,
		},
		query: {
			kind: "parsed",
			brief: "The query field",
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
	command: "websearch",
	describe: "Search the web through AI Gateway",
	usage: "$0 ai websearch\n\nRun a web search through a configured AI Gateway.",
	...parameters,
	loader: () => import("./websearch.handler.js"),
});

export default command;
