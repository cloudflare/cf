/**
 * run command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"article-id": {
			kind: "parsed",
			brief: "Threat Signals article UUID",
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
	operands: [
		{
			placeholder: "skill-id",
			brief:
				"UUID of an active Custom Skill that is assigned to the article's feed, or a managed default skill ID. Requires a paid Threat Signals subscription and the Cloudforce One Write permission. Always persists output; rerunning overwrites the previous result. No diagnostic or server-preview inputs.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "run <skill-id>",
	describe: "Run and persist skill output for a Threat Signals article",
	usage:
		"$0 cloudforce-one threat-signals articles skills run <skill-id>\n\nRun an active Custom Skill assigned to the article's feed, or run a managed default skill. Requires a paid Threat Signals subscription and the Cloudforce One Write permission. Always persists output; rerunning overwrites the previous result. Does not expose diagnostic model data or accept server-preview inputs.",
	...parameters,
	loader: () => import("./run.handler.js"),
});

export default command;
