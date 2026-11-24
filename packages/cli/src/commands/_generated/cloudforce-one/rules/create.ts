/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		actions: {
			kind: "parsed",
			brief:
				'The actions field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"action_config": {...}, "action_type": "alert_gchat" | "webhook" | "logging" | ...more, "enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"commit-message": {
			kind: "parsed",
			brief:
				"Human-readable justification for this change. Required for internal-account submissions; optional for customer accounts and automated sync.",
			optional: true,
			parse: String,
		},
		content: {
			kind: "parsed",
			brief: "The content field",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief:
				"Human-readable description of the rule. Auto-extracted from YARA meta if present.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether this rule is active for dice consumers.",
			default: true,
		},
		"is-public": {
			kind: "boolean",
			brief: "Whether this rule is visible to other internal accounts.",
			default: false,
		},
		meta: {
			kind: "parsed",
			brief:
				"Adds YARA meta entries to the rule's meta block and stores them in rule_meta alongside content metadata. Use valid YARA identifiers for keys; exclude 'name', 'enabled', and 'description'. You may repeat keys. Provide as a JSON array of objects or @path/to/file.json. Shape: [{\"key\": string, \"value\": (string | number | boolean)}].",
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
			brief:
				"Optional WfP deployment tags (customer rules only). Internal rules leave empty.",
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
	command: "create",
	describe: "Create a rule",
	usage: "$0 cloudforce-one rules create\n\nCreate a new detection rule.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
