/**
 * screenshot command
 * @generated from apis/overlays/url-scanner.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		resolution: {
			kind: "enum",
			brief: "Target device type.",
			values: ["desktop", "mobile", "tablet"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [{ placeholder: "scan-id", brief: "Scan UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "screenshot <scan-id>",
	describe: "Get screenshot",
	usage:
		"$0 url-scanner scans screenshot <scan-id>\n\nGet scan's screenshot by resolution (desktop/mobile/tablet).",
	...parameters,
	loader: () => import("./screenshot.handler.js"),
});

export default command;
