/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"skill-config": {
			kind: "parsed",
			brief:
				"Optional skill configuration (stored but not currently interpreted).",
			optional: true,
			parse: String,
		},
		"is-active": {
			kind: "boolean",
			brief: "Whether the skill is active and eligible for feed assignment.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Custom Skill name (1–100 characters).",
			optional: true,
			parse: String,
		},
		"output-schema": {
			kind: "parsed",
			brief: "JSON Schema serialized as a string (max 4096 characters).",
			optional: true,
			parse: String,
		},
		prompt: {
			kind: "parsed",
			brief: "AI prompt (1–4000 characters) defining the skill's instructions.",
			optional: true,
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
			brief: "Custom Skill UUID or a Managed Default Skill ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <skill-id>",
	describe: "Update Threat Signals skill",
	usage:
		"$0 cloudforce-one threat-signals skills update <skill-id>\n\nUpdates a Custom Skill. Managed Default Skills cannot be updated. Free Threat Signals accounts cannot update Custom Skills.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
