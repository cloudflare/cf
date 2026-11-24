/**
 * aggregate-severity command
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
		"pir-id": {
			kind: "parsed",
			brief:
				"Beta. Active Priority Intelligence Requirement to count for. articles then counts only articles scored against it, min_relevance applies to its score, and priorities lists only it. Returns a 400 error unless the PIR is active.",
			optional: true,
			parse: String,
		},
		"min-relevance": {
			kind: "enum",
			brief:
				"Beta. Count only articles at or above this relevance band: in articles, for any active Priority Intelligence Requirement, as the article list's min_relevance does without pir_id; in each priority, for that PIR. Excludes articles that have not been scored against an active PIR.",
			values: ["low", "medium", "high"],
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
	command: "aggregate-severity",
	describe: "Count Threat Signals articles by severity band",
	usage:
		"$0 cloudforce-one threat-signals articles aggregate-severity\n\nBeta. Counts the account's Threat Signals articles in each intrinsic severity band. An article's band is the one reported as its severity, from informational to critical. Articles without a severity are not counted. Also counts, for each active Priority Intelligence Requirement, the articles scored against it. min_relevance counts only articles at or above a relevance band: overall, for any active PIR; per PIR, for that PIR, the same rule as the per-PIR relevance counts. pir_id counts for one active PIR only. read counts only read or only unread articles, in both articles and priorities. Like the article severity field, severity is reported only while the account has an active Priority Intelligence Requirement, including one the matcher paused; otherwise every count is zero and priorities is empty. All counts are read together and are exact.",
	...parameters,
	loader: () => import("./aggregate-severity.handler.js"),
});

export default command;
