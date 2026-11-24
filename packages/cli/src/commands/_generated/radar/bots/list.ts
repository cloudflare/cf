/**
 * list command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		limit: {
			kind: "parsed",
			brief: "Limits the number of objects returned in the response.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Skips the specified number of objects before fetching the results.",
			optional: true,
			parse: Number,
		},
		"bot-category": {
			kind: "enum",
			brief:
				"Filters results by bot category. `ACCESSIBILITY`, `AGGREGATOR`, `AI_SEARCH`, `ARCHIVER`, `SOCIAL_MEDIA_MARKETING` and `WEBHOOKS` are deprecated legacy categories that match only that exact category.",
			values: [
				"ACADEMIC_RESEARCH",
				"ADVERTISING_AND_MARKETING",
				"AI_ASSISTANT",
				"AI_CRAWLER",
				"COMMERCE",
				"FEED_FETCHER",
				"MONITORING_AND_ANALYTICS",
				"OTHER",
				"PAGE_PREVIEW",
				"SEARCH_ENGINE_CRAWLER",
				"SEARCH_ENGINE_OPTIMIZATION",
				"SECURITY",
				"ACCESSIBILITY",
				"AGGREGATOR",
				"AI_SEARCH",
				"ARCHIVER",
				"SOCIAL_MEDIA_MARKETING",
				"WEBHOOKS",
			],
			optional: true,
		},
		"bot-operator": {
			kind: "parsed",
			brief: "Filters results by bot operator.",
			optional: true,
			parse: String,
		},
		kind: {
			kind: "enum",
			brief:
				"Filters results by bot kind. Deprecated: the Verified Bot / Signed Agent distinction is being removed.",
			values: ["AGENT", "BOT"],
			optional: true,
		},
		"bot-verification-status": {
			kind: "enum",
			brief: "Filters results by bot verification status.",
			values: ["VERIFIED"],
			optional: true,
		},
		format: {
			kind: "enum",
			brief: "Format in which results will be returned.",
			values: ["JSON", "CSV"],
			optional: true,
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
	describe: "List bots",
	usage: "$0 radar bots list\n\nRetrieves a list of bots.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
