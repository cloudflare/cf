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
		dimension: {
			kind: "parsed",
			brief: "The dimension field",
			optional: true,
			choices: [
				"actor",
				"targetIndustry",
				"category",
				"country",
				"attackerCountry",
				"targetCountry",
				"mitreAttack",
				"killChain",
				"mitreCapec",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "dimension", "text"),
		},
		enabled: { kind: "boolean", brief: "The enabled field", default: true },
		value: {
			kind: "parsed",
			brief: "The value field",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create an account interest for PIR Option 2",
	usage:
		"$0 cloudforce-one priority-intelligence interests create\n\nCreates a structured account interest used by Priority Intelligence Option 2 evaluations. Interests are evaluated independently from free-form PIR requirements.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
