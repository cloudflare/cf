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
		description: {
			kind: "parsed",
			brief:
				"RFI description (optional). Defaults to an empty string when omitted.",
			optional: true,
			parse: String,
		},
		"event-id": {
			kind: "parsed",
			brief: "Optional related event ID",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				'Optional metadata fields specific to the RFI type. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"RFI priority. Four-level projects use `low`, `routine`, `high`, `urgent`; existing projects retain legacy `low`->routine compatibility. `medium`, `critical`, and `unknown` remain accepted legacy aliases. Defaults to `routine`.",
			optional: true,
			choices: [
				"low",
				"routine",
				"high",
				"urgent",
				"unknown",
				"medium",
				"critical",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "priority", "text"),
		},
		"request-type": {
			kind: "parsed",
			brief: "Optional request type for the request",
			optional: true,
			parse: String,
		},
		"subtype-id": {
			kind: "parsed",
			brief: "Optional subtype ID",
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief:
				"RFI title (optional). When omitted, the server generates a summary from the request type and readable ID.",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief:
				"Traffic Light Protocol level. Canonical values are `clear`, `green`, `amber`, `amber-strict`, `red`, `purple`. `white` and `amber+strict` are accepted input aliases; responses always use the canonical spelling.",
			optional: true,
			choices: [
				"clear",
				"green",
				"amber",
				"amber-strict",
				"red",
				"purple",
				"white",
				"amber+strict",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "tlp", "text"),
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
		{ placeholder: "project-type", brief: "RFI project type", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <project-type>",
	describe: "Creates a new RFI",
	usage:
		"$0 cloudforce-one requests create <project-type>\n\nCreates a new Request for Information with the specified project type and details.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
