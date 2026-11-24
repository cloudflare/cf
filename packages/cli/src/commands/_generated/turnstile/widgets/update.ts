/**
 * update command
 * @generated from apis/overlays/turnstile.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"bot-fight-mode": {
			kind: "boolean",
			brief:
				"If bot_fight_mode is set to `true`, Cloudflare issues computationally\nexpensive challenges in response to malicious bots (ENT only).\n",
			optional: true,
		},
		"clearance-level": {
			kind: "parsed",
			brief:
				"If Turnstile is embedded on a Cloudflare site and the widget should grant challenge clearance,\nthis setting can determine the clearance level to be set\n",
			optional: true,
			choices: ["no_clearance", "jschallenge", "managed", "interactive"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "clearance-level", "text"),
		},
		domains: {
			kind: "parsed",
			brief: "The domains field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ephemeral-id": {
			kind: "boolean",
			brief: "Return the Ephemeral ID in /siteverify (ENT only).\n",
			optional: true,
		},
		"widget-mode": {
			kind: "parsed",
			brief: "Widget mode",
			optional: true,
			choices: ["non-interactive", "invisible", "managed"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "widget-mode", "text"),
		},
		name: {
			kind: "parsed",
			brief:
				"Human readable widget name. Not unique. Cloudflare suggests that you\nset this to a meaningful string to make it easier to identify your\nwidget, and where it is used.\n",
			optional: true,
			parse: String,
		},
		offlabel: {
			kind: "boolean",
			brief: "Do not show any Cloudflare branding on the widget (ENT only).\n",
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
		{
			placeholder: "sitekey",
			brief: "Unique identifier for a Turnstile widget.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <sitekey>",
	describe: "Update a Turnstile Widget",
	usage:
		"$0 turnstile widgets update <sitekey>\n\nUpdates the configuration of a Turnstile widget.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
