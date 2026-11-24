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
		"value-allowed-origins": {
			kind: "parsed",
			brief:
				'Comma-separated list of allowed origin domains for image and video transformations.\nUse "*" to allow all origins (default).\n',
			optional: true,
			parse: String,
		},
		"value-c2pa": {
			kind: "parsed",
			brief: "Whether C2PA signing is enabled for image transformations.",
			optional: true,
			choices: ["off", "on"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "value-c2pa", "text"),
		},
		"value-transformations": {
			kind: "parsed",
			brief:
				'Controls Image Transformations behavior:\n- "off": Feature disabled.\n- "on": Transformations enabled for same-zone images only.\n- "open": Transformations enabled for images from any origin.\n- "latest": Transformations enabled using the latest version.\n',
			optional: true,
			choices: ["off", "on", "open", "latest"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "value-transformations", "text"),
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
	describe: "Change Transformations configuration",
	usage:
		"$0 zones transformations-config edit\n\nUpdates one or more fields of the combined Transformations configuration for a zone. Omitted fields are left unchanged. The response always returns the full current state of all three sub-settings.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
