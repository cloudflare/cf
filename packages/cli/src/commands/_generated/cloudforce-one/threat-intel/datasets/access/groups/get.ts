/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
	operands: [{ placeholder: "group-id", brief: "Group ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <group-id>",
	describe: "Get an account group",
	usage:
		"$0 cloudforce-one threat-intel datasets access groups get <group-id>\n\nReturns an account group by its ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
