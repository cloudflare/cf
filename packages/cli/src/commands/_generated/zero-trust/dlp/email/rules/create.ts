/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"action-action": {
			kind: "parsed",
			brief: "The action.action field",
			optional: true,
			choices: ["Block"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "action-action", "text"),
		},
		"action-message": {
			kind: "parsed",
			brief: "The action.message field",
			optional: true,
			parse: String,
		},
		conditions: {
			kind: "parsed",
			brief:
				'Triggered if all conditions match. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"operator": "InList" | "NotInList" | "MatchRegex" | ...more, "selector": "Recipients" | "Sender" | "DLPProfiles", "value": ([string] | string)}].',
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
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
			brief: "Rule description.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create email scanner rule",
	usage:
		"$0 zero-trust dlp email rules create\n\nCreates a new DLP email scanning rule that defines what content patterns to detect in email messages and what actions to take.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
