/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Items per page",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List monitored domains",
	usage:
		"$0 cloudforce-one credential-monitor domains list\n\nList all domains registered for credential monitoring.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
