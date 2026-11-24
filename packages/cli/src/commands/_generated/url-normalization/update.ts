/**
 * update command
 * @generated from apis/overlays/url-normalization.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		scope: {
			kind: "parsed",
			brief: "The scope of the URL normalization.",
			optional: true,
			choices: ["incoming", "both", "none"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope", "text"),
		},
		type: {
			kind: "parsed",
			brief: "The type of URL normalization performed by Cloudflare.",
			optional: true,
			choices: ["cloudflare", "rfc3986"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "A URL Normalization object.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update URL Normalization settings",
	usage:
		"$0 url-normalization update\n\nUpdates the URL Normalization settings.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
