/**
 * validate command
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
		template: {
			kind: "parsed",
			brief: "The Liquid template to validate.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Custom page type.",
			optional: true,
			choices: ["identity_denied", "forbidden", "login", "interstitial"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"contract-version": {
			kind: "parsed",
			brief: "Contract version to validate against; omit for the latest.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "A template to validate without persisting it.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "validate",
	describe: "Validate a custom page template",
	usage:
		"$0 zero-trust access custom-pages validate\n\nValidate a Liquid template and return its errors and warnings without persisting it.",
	...parameters,
	loader: () => import("./validate.handler.js"),
});

export default command;
