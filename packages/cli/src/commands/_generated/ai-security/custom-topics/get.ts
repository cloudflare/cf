/**
 * get command
 * @generated from apis/overlays/ai-security.ts
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get the AI Security for Apps custom topics of a zone.",
	usage:
		"$0 ai-security custom-topics get\n\nGet the custom topic categories defined for the zone. While AI Security for Apps is enabled, it scores every incoming prompt against these topics and writes the scores to the `cf.llm.prompt.custom_topic_categories` field, keyed by topic label. Topics can be configured while the detection is disabled, but no prompt is scored until you enable it.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
