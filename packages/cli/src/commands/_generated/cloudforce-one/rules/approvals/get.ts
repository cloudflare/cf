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
	operands: [
		{
			placeholder: "id",
			brief: "The unique identifier for the approval.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <id>",
	describe: "Get rule approval details",
	usage:
		"$0 cloudforce-one rules approvals get <id>\n\nGet a single rule approval with current rule data.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
