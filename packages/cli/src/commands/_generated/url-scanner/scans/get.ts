/**
 * get command
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
	command: "get <scan-id>",
	describe: "Get URL scan",
	usage: "$0 url-scanner scans get <scan-id>\n\nGet URL scan by uuid",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
