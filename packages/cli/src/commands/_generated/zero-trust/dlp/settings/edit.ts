/**
 * edit command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"ai-context-analysis": {
			kind: "boolean",
			brief: "Whether AI context analysis is enabled at the account level.",
			optional: true,
		},
		ocr: {
			kind: "boolean",
			brief: "Whether OCR is enabled at the account level.",
			optional: true,
		},
		"payload-logging-masking-level": {
			kind: "parsed",
			brief:
				"Masking level for payload logs.\n\n- `full`: The entire payload is masked.\n- `partial`: Only partial payload content is masked.\n- `clear`: No masking is applied to the payload content.\n- `default`: DLP uses its default masking behavior.",
			optional: true,
			choices: ["full", "partial", "clear", "default"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "payload-logging-masking-level", "text"),
		},
		"payload-logging-public-key": {
			kind: "parsed",
			brief:
				"Base64-encoded public key for encrypting payload logs.\n\n- Set to a non-empty base64 string to enable payload logging with the given key.\n- Set to an empty string to disable payload logging.\n- Omit or set to null to leave unchanged (PATCH) or reset to disabled (PUT).",
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
			brief: "DLP settings fields to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Partially update DLP account-level settings.",
	usage:
		"$0 zero-trust dlp settings edit\n\nMissing fields keep their existing values.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
