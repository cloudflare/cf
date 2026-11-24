/**
 * update command
 * @generated from apis/overlays/smart-shield.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"cache-reserve-value": {
			kind: "parsed",
			brief: "Specifies the enablement value of Cache Reserve.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "cache-reserve-value", "text"),
		},
		"regional-tiered-cache-value": {
			kind: "parsed",
			brief: "Specifies the enablement value of Regional Tiered Cache.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "regional-tiered-cache-value", "text"),
		},
		"smart-routing-value": {
			kind: "parsed",
			brief: "Specifies the enablement value of Smart Routing.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "smart-routing-value", "text"),
		},
		"smart-tiered-cache-value": {
			kind: "parsed",
			brief: "Specifies the enablement value of Smart Tiered Cache.",
			optional: true,
			choices: ["on", "off"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "smart-tiered-cache-value", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The patch body for Smart Shield.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Patch Smart Shield Settings",
	usage: "$0 smart-shield update\n\nSet Smart Shield Settings.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
