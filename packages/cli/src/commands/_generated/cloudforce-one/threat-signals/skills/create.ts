/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
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
		type: {
			kind: "parsed",
			brief:
				'Optional label; does not affect execution. Defaults to "summary".',
			default: "summary",
			choices: ["summary", "tags"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Threat Signals skill",
	usage:
		"$0 cloudforce-one threat-signals skills create\n\nCreates an active Custom Skill for the account. Free Threat Signals accounts cannot create Custom Skills. When the account is at its active Custom Skill limit (`cfone.threat.threat_signals_skills`), returns 403 with `errors[0].reason` `threat_signals_skill_limit`, and `errors[0].custom_skill_limit` and `errors[0].custom_skill_count` give the limit and current count. Managed Default Skills do not count.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
