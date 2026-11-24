/**
 * create command
 * @generated from apis/overlays/bot-management.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		expression: {
			kind: "parsed",
			brief: "Wirefilter expression describing the traffic being reported.",
			optional: true,
			parse: String,
		},
		"first-request-seen-at": {
			kind: "parsed",
			brief: "The first_request_seen_at field",
			optional: true,
			parse: String,
		},
		"last-request-seen-at": {
			kind: "parsed",
			brief: "The last_request_seen_at field",
			optional: true,
			parse: String,
		},
		requests: {
			kind: "parsed",
			brief: "The requests field",
			optional: true,
			parse: Number,
		},
		"requests-by-attribute": {
			kind: "parsed",
			brief:
				'Top attributes contributing to the feedback sample. Keys include topASNs, topCountries, topHosts, topIPs, topJA3Hashes, topJA4s, topPaths, topUserAgents. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [{...}]}.',
			optional: true,
			parse: String,
		},
		"requests-by-score": {
			kind: "parsed",
			brief:
				'Map of bot scores (1-99) to request counts. Sum must equal `requests`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": number}.',
			optional: true,
			parse: String,
		},
		"requests-by-score-src": {
			kind: "parsed",
			brief:
				'Map of score source to request counts. Sum must equal `requests`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": number}.',
			optional: true,
			parse: String,
		},
		subtype: {
			kind: "parsed",
			brief: "The subtype field",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Type of feedback report.",
			optional: true,
			choices: ["false_positive", "false_negative"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
	command: "create",
	describe: "Submit a feedback report",
	usage:
		"$0 bot-management feedback create\n\nSubmit a feedback report for the specified zone. Use `type` to indicate whether the report is a false positive (good traffic flagged as bot) or a false negative (bot traffic missed). Furthermore, you can also use `expression` as a wirefilter to identify the affected traffic sample. See more accepted API fields and expression types at https://developers.cloudflare.com/bots/concepts/feedback-loop/#api-fields and https://developers.cloudflare.com/bots/concepts/feedback-loop/#expression-fields, respectively.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
