/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
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
			placeholder: "rule-id",
			brief: "The UUID of the SYN Protection rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <rule-id>",
	describe: "Get SYN Protection rule.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs syn protection rules get <rule-id>\n\nGet a SYN Protection rule specified by the given UUID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
