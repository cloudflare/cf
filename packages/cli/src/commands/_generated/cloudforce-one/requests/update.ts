/**
 * update command
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
		"project-type": {
			kind: "parsed",
			brief:
				"RFI project type. Valid values: threat-intelligence, incident-response, ir-emergency-response, table-top, pentest, irp, threat-hunting, cybersecurity-assessment, react-general, legal-response, soc-alerts, demo",
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "RFI description",
			optional: true,
			parse: String,
		},
		"event-id": {
			kind: "parsed",
			brief: "Optional related event ID",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"RFI priority. Four-level projects use a distinct `low` level; existing projects retain legacy `low`->routine compatibility. `medium`, `critical`, and `unknown` remain accepted legacy aliases.",
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
			brief:
				"Request type. May only be changed while the request is still open; changing it recalculates the request's token cost.",
			optional: true,
			parse: String,
		},
		"subtype-id": {
			kind: "parsed",
			brief: "Optional subtype ID",
			optional: true,
			parse: String,
		},
		summary: {
			kind: "parsed",
			brief: "RFI summary",
			optional: true,
			parse: String,
		},
		title: {
			kind: "parsed",
			brief: "RFI title (alias for summary field)",
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief:
				"Traffic Light Protocol level. `white` and `amber+strict` are accepted input aliases; responses always use the canonical spelling.",
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
	operands: [{ placeholder: "request-id", brief: "RFI UUID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <request-id>",
	describe: "Update an RFI",
	usage:
		"$0 cloudforce-one requests update <request-id>\n\nUpdates an existing RFI with the provided fields. Only provided fields will be updated.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
