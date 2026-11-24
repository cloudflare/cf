/**
 * submit command
 * @generated from apis/overlays/pay-per-use.ts
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "submit",
	describe: "Submit a participant usage report",
	usage:
		"$0 pay-per-use usage-reports submit\n\nValidates and submits a usage report for an active Pay Per Use participant. The complete report is rejected if any item is invalid.",
	...parameters,
	loader: () => import("./submit.handler.js"),
});

export default command;
