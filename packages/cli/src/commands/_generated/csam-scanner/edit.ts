/**
 * edit command
 * @generated from apis/overlays/csam-scanner.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		id: {
			kind: "parsed",
			brief: "The feature identifier.",
			optional: true,
			choices: ["csam_scanner"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "id", "text"),
		},
		"value-email": {
			kind: "parsed",
			brief:
				"Notification email address for CSAM scan results. When changed,\nemail verification is triggered automatically.\n",
			optional: true,
			parse: String,
		},
		"value-enabled": {
			kind: "boolean",
			brief: "Whether CSAM scanning is enabled for this zone.",
			optional: true,
		},
		"value-resend-email": {
			kind: "boolean",
			brief:
				"Set to true to trigger re-sending the email verification.\nWrite-only; never appears in responses (omitted when false).\n",
			optional: true,
		},
		"value-sources": {
			kind: "parsed",
			brief:
				'Map of scanning sources and their enabled state. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": boolean}.',
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
			brief: "Request body for updating CSAM Scanner configuration. ",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Update CSAM Scanner setting",
	usage:
		"$0 csam-scanner edit\n\nUpdate the CSAM Scanner configuration for a zone. Allows enabling or disabling CSAM scanning, updating the notification email, and configuring scanning sources. This is a partial update: fields omitted from `value` keep their current setting, and `sources` is merged per source (`null` clears all sources). Send an empty `email` to clear the notification address. When a new email is provided, email verification is triggered automatically. The `enabled` field is a toggle; the server may adjust it based on whether the notification email is verified. Returns 403 if the zone or account is locked by Trust & Safety.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
