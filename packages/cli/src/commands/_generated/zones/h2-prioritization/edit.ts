/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		value: {
			kind: "parsed",
			brief:
				'Controls HTTP/2 Prioritization behavior:\n- "off": Use browser default prioritization.\n- "on": Use Cloudflare\'s optimized prioritization.\n- "custom": Use custom prioritization rules.\n',
			optional: true,
			choices: ["off", "on", "custom"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "value", "text"),
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
	command: "edit",
	describe: "Change HTTP/2 Prioritization setting",
	usage:
		"$0 zones h2-prioritization edit\n\nHTTP/2 Prioritization controls the order in which assets are delivered to browsers. Cloudflare's HTTP/2 Prioritization overrides the default browser prioritization order, improving the loading performance of web pages.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
