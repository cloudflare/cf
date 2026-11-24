/**
 * validate command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		content: {
			kind: "parsed",
			brief: "The content field",
			optional: true,
			parse: String,
		},
		"exclude-rule-id": {
			kind: "parsed",
			brief: "The excludeRuleId field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		namespaces: {
			kind: "parsed",
			brief: "The namespaces field",
			variadic: true,
			optional: true,
			parse: String,
		},
		path: {
			kind: "parsed",
			brief: "The path field",
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
	command: "validate",
	describe: "Validate rule with context",
	usage:
		"$0 cloudforce-one rules validate\n\nValidates rule syntax, name uniqueness, namespace, and metadata.",
	...parameters,
	loader: () => import("./validate.handler.js"),
});

export default command;
