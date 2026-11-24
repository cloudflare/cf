/**
 * generate command
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
	command: "generate <article-id>",
	describe: "Generate Threat Signals article AI tags",
	usage:
		"$0 cloudforce-one threat-signals articles tags generate <article-id>\n\nRuns the default AI tagging skill on an article and replaces its AI-applied tags.",
	...parameters,
	loader: () => import("./generate.handler.js"),
});

export default command;
