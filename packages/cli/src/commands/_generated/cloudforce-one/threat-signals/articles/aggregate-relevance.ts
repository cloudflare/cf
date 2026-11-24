/**
 * aggregate-relevance command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"published-after": {
			kind: "parsed",
			brief:
				"Include articles published at or after this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
			optional: true,
			parse: String,
		},
		"published-before": {
			kind: "parsed",
			brief:
				"Include articles published at or before this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
			optional: true,
			parse: String,
		},
		read: {
			kind: "boolean",
			brief:
				"Filter by read state. Accepts true, false, 1, or 0; omit to include read and unread articles.",
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
	command: "aggregate-relevance",
	describe: "Count Threat Signals articles by relevance band",
	usage:
		"$0 cloudforce-one threat-signals articles aggregate-relevance\n\nBeta. Counts the account's Threat Signals articles in each relevance band, for each active Priority Intelligence Requirement and across all of them. Uses the same PIRs as article relevance: active PIRs, including those the matcher paused; drafts and deleted PIRs are excluded. Articles not scored against a PIR are not counted for it. The combined counts place each article once, in the band of its best score, so they are not the sum of the per-PIR counts. read counts only read or only unread articles. All counts are read together and are exact.",
	...parameters,
	loader: () => import("./aggregate-relevance.handler.js"),
});

export default command;
