/**
 * create command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"instance-id": {
			kind: "parsed",
			brief:
				"The system reserves IDs that consist of the `cf_` prefix and exactly 64 lowercase hexadecimal characters.",
			optional: true,
			parse: String,
		},
		"instance-retention-error": {
			kind: "parsed",
			brief:
				"Specifies the duration in milliseconds or as a string like '5 minutes'. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"instance-retention-success": {
			kind: "parsed",
			brief:
				"Specifies the duration in milliseconds or as a string like '5 minutes'. Accepts a JSON scalar or plain string, or @path/to/file.",
			optional: true,
			parse: String,
		},
		"location-hint": {
			kind: "parsed",
			brief: "The location_hint field",
			optional: true,
			choices: [
				"wnam",
				"weur",
				"enam",
				"eeur",
				"apac",
				"apac-ne",
				"apac-se",
				"oc",
				"sam",
				"afr",
				"me",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "location-hint", "text"),
		},
		params: {
			kind: "parsed",
			brief: "JSON-encoded event payload passed into the new instance.",
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
		{ placeholder: "workflow-name", brief: "Workflow name", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <workflow-name>",
	describe: "Create a new workflow instance",
	usage:
		"$0 workflows instances create <workflow-name>\n\nCreates a new instance of a workflow, starting its execution.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
