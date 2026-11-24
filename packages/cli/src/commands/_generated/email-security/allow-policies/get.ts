/**
 * get command
 * @generated from apis/overlays/email-security.ts
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
	operands: [
		{
			placeholder: "policy-id",
			brief: "Allow policy identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <policy-id>",
	describe: "Get an email allow policy",
	usage:
		"$0 email-security allow-policies get <policy-id>\n\nRetrieves details for a specific allow policy including its pattern, dispositions that are exempted, and whether it applies to all detections.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
