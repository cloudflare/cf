/**
 * create command
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"automatic-advertisement": {
			kind: "boolean",
			brief:
				"Toggle on if you would like Cloudflare to automatically advertise the IP Prefixes within the rule via Magic Transit when the rule is triggered. Only available for users of Magic Transit.",
			optional: true,
		},
		"bandwidth-threshold": {
			kind: "parsed",
			brief:
				"The number of bits per second for the rule. When this value is exceeded for the set duration, an alert notification is sent. Minimum of 1 and no maximum.",
			optional: true,
			parse: Number,
		},
		duration: {
			kind: "parsed",
			brief:
				'The amount of time that the rule threshold must be exceeded to send an alert notification. The final value must be equivalent to one of the following 8 values ["1m","5m","10m","15m","20m","30m","45m","60m"].',
			default: "1m",
			choices: ["1m", "5m", "10m", "15m", "20m", "30m", "45m", "60m"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "duration", "text"),
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the rule. Must be unique. Supports characters A-Z, a-z, 0-9, underscore (_), dash (-), period (.), and tilde (~). You can’t have a space in the rule name. Max 256 characters.",
			optional: true,
			parse: String,
		},
		"packet-threshold": {
			kind: "parsed",
			brief:
				"The number of packets per second for the rule. When this value is exceeded for the set duration, an alert notification is sent. Minimum of 1 and no maximum.",
			optional: true,
			parse: Number,
		},
		"prefix-match": {
			kind: "parsed",
			brief:
				"Prefix match type to be applied for a prefix auto advertisement when using an advanced_ddos rule.",
			optional: true,
			choices: ["exact", "subnet", "supernet"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "prefix-match", "text"),
		},
		prefixes: {
			kind: "parsed",
			brief: "The prefixes field",
			variadic: true,
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "MNM rule type.",
			optional: true,
			choices: ["threshold", "zscore", "advanced_ddos"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"zscore-sensitivity": {
			kind: "parsed",
			brief: "Level of sensitivity set for zscore rules.",
			optional: true,
			choices: ["low", "medium", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "zscore-sensitivity", "text"),
		},
		"zscore-target": {
			kind: "parsed",
			brief: "Target of the zscore rule analysis.",
			optional: true,
			choices: ["bits", "packets"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "zscore-target", "text"),
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
	describe: "Create rules",
	usage:
		"$0 magic-network-monitoring rules create\n\nCreate network monitoring rules for account. Currently only supports creating a single rule per API request.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
