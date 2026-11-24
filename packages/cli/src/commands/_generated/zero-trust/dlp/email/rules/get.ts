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
	operands: [{ placeholder: "rule-id", brief: "Rule ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <rule-id>",
	describe: "Get an email scanner rule",
	usage:
		"$0 zero-trust dlp email rules get <rule-id>\n\nGets detailed configuration for a specific DLP email scanning rule, including detection patterns and actions.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
