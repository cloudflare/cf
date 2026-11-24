/**
 * delete command
 * @generated from apis/overlays/email-routing.ts
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "rule-identifier",
			brief: "Routing rule identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <rule-identifier>",
	describe: "Delete routing rule",
	usage:
		"$0 email-routing rules delete <rule-identifier>\n\nDeletes a routing rule so matching incoming messages are no longer forwarded by it.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
