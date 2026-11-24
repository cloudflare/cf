/**
 * get command
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
			placeholder: "skill-id",
			brief: "Custom Skill UUID or a Managed Default Skill ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <skill-id>",
	describe: "Get Threat Signals skill",
	usage:
		"$0 cloudforce-one threat-signals skills get <skill-id>\n\nRetrieves a Managed Default Skill or Custom Skill. Managed catalog definitions are readable. Free Threat Signals accounts cannot read Custom Skills.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
