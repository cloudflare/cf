/**
 * create command
 * @generated from apis/overlays/connectors.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"device-id": {
			kind: "parsed",
			brief: "The device.id field",
			optional: true,
			parse: String,
		},
		"device-provision-license": {
			kind: "boolean",
			brief:
				"When true, create and provision a new licence key for the connector.",
			optional: true,
		},
		"device-serial-number": {
			kind: "parsed",
			brief: "The device.serial_number field",
			optional: true,
			parse: String,
		},
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
	describe: "Create Connector",
	usage: "$0 connectors create\n\nCreates a Magic WAN Connector.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
