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
				'Controls Image Resizing behavior:\n- "off": Feature disabled.\n- "on": Resizing is enabled for same-zone images only.\n- "open": Resizing is enabled for images from any origin.\n- "latest": Resizing is enabled for same-zone images using the latest version.\n',
			optional: true,
			choices: ["off", "on", "open", "latest"],
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
	describe: "Change Image Transformations setting",
	usage:
		"$0 zones image-resizing edit\n\nSets the Image Transformations setting for a zone. Accepted values are `off`, `on`, `open`, and `latest`.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
