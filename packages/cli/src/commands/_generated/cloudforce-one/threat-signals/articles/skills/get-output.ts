/**
 * get-output command
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
	},
	operands: [
		{
			placeholder: "skill-id",
			brief:
				"Custom Skill UUID or a Managed Default Skill ID (IOC-context: default-ioc-context-skill)",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-output <skill-id>",
	describe: "Get Threat Signals article skill output",
	usage:
		"$0 cloudforce-one threat-signals articles skills get-output <skill-id>\n\nRetrieves the stored output of a skill for a Threat Signals article. The custom_output field is parsed JSON when the stored output is valid JSON, otherwise the raw string.",
	...parameters,
	loader: () => import("./get-output.handler.js"),
});

export default command;
