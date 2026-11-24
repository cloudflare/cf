/**
 * get command
 * @generated from apis/overlays/iam.ts
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
			placeholder: "permission-group-id",
			brief: "Permission Group identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <permission-group-id>",
	describe: "Permission Group Details",
	usage:
		"$0 iam permission-groups get <permission-group-id>\n\nGet information about a specific permission group in an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
