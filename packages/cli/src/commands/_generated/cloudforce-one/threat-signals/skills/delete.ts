/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <skill-id>",
	describe: "Delete Threat Signals skill",
	usage:
		"$0 cloudforce-one threat-signals skills delete <skill-id>\n\nDeletes a Custom Skill. The skill's stored outputs on articles are deleted with it. Managed Default Skills cannot be deleted. Free Threat Signals accounts cannot delete Custom Skills.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
