/**
 * edit command
 * @generated from apis/overlays/connectors.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		activated: {
			kind: "boolean",
			brief: "The activated field",
			optional: true,
		},
		"interrupt-window-days-of-week": {
			kind: "parsed",
			brief: "Allowed days of the week for upgrades. Default is all days.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"interrupt-window-duration-hours": {
			kind: "parsed",
			brief: "The interrupt_window_duration_hours field",
			optional: true,
			parse: Number,
		},
		"interrupt-window-embargo-dates": {
			kind: "parsed",
			brief: "List of dates (YYYY-MM-DD) when upgrades are blocked.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"interrupt-window-hour-of-day": {
			kind: "parsed",
			brief: "The interrupt_window_hour_of_day field",
			optional: true,
			parse: Number,
		},
		notes: {
			kind: "parsed",
			brief: "The notes field",
			optional: true,
			parse: String,
		},
		timezone: {
			kind: "parsed",
			brief: "The timezone field",
			optional: true,
			parse: String,
		},
		"provision-license": {
			kind: "boolean",
			brief: "When true, regenerate license key for the connector.",
			optional: true,
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
		{ placeholder: "connector-id", brief: "Connector ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <connector-id>",
	describe: "Edit Connector",
	usage:
		"$0 connectors edit <connector-id>\n\nEdits properties of a Magic WAN Connector. May be used to re-provision a license key.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
