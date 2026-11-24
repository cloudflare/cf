/**
 * dom command
 * @generated from apis/overlays/url-scanner.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "scan-id", brief: "Scan UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "dom <scan-id>",
	describe: "Get URL scan's DOM",
	usage:
		"$0 url-scanner scans dom <scan-id>\n\nReturns a plain text response, with the scan's DOM content as rendered by Chrome.",
	...parameters,
	loader: () => import("./dom.handler.js"),
});

export default command;
