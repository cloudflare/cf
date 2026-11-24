/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
	operands: [{ placeholder: "rule-id", brief: "API UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <rule-id>",
	describe: "Get posture rule",
	usage:
		"$0 zero-trust devices posture rules get <rule-id>\n\nFetches a single device posture rule.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
