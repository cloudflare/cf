/**
 * update command
 * @generated from apis/overlays/cps.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"language-locale": {
			kind: "parsed",
			brief:
				"The user's preferred language locale for communications. If omitted, the language locale does not change.",
			optional: true,
			choices: [
				"en-US",
				"es-ES",
				"de-DE",
				"fr-FR",
				"it-IT",
				"ja-JP",
				"ko-KR",
				"pt-BR",
				"zh-CN",
				"zh-TW",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "language-locale", "text"),
		},
		preferences: {
			kind: "parsed",
			brief:
				'Preference keys mapped to subscription states to update. Only the preferences in this map change; others remain unchanged. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
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
			brief:
				"Request body for updating communication preferences. An email field in the payload is ignored; email verification state is managed separately, so the field is excluded from this schema.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update communication preferences",
	usage:
		"$0 cps update\n\nSet one or more communication preferences for the authenticated user. Supply a map of preference keys to subscription states, and an optional language locale. This endpoint does not modify email verification settings. Callers authenticate with standard Cloudflare API tokens or keys.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
