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
			brief:
				"Must be default-tagging-skill; configures the managed default tagging skill",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <skill-id>",
	describe: "Get Threat Signals skill tag categories",
	usage:
		"$0 cloudforce-one threat-signals skills tag-categories get <skill-id>\n\nRetrieves the Tag Categories the managed default tagging skill may select tags from. This configures the managed default tagging skill, not Custom Skills.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
