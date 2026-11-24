/**
 * reprocess command
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
	command: "reprocess <article-id>",
	describe: "Reprocess a Threat Signals article",
	usage:
		"$0 cloudforce-one threat-signals articles reprocess <article-id>\n\nSynchronously re-runs every processing step for a Threat Signals article: pull content, clean content, extract IOCs, filter IOCs, summary, CVE tags, IOC context, article tags, and Event publication. Replaces the article's summary, AI tags, and indicators; indicators no longer found are removed. Creates a Threat Event only when the article has none; an existing Event is never updated. Takes over the article from any queued processing. Requires a paid Threat Signals subscription and the Cloudforce One Write permission.",
	...parameters,
	loader: () => import("./reprocess.handler.js"),
});

export default command;
