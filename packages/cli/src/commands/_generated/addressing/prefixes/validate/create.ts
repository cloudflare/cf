/**
 * create command
 * @generated from apis/overlays/addressing.ts
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
			placeholder: "prefix-id",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <prefix-id>",
	describe: "Validate Prefix",
	usage:
		"$0 addressing prefixes validate create <prefix-id>\n\nTriggers a new prefix validation. The checks run asynchronously and include IRR, RPKI, prefix ownership, and, when applicable, ASN ownership and Autonomous System Provider Authorization (ASPA). Use Prefix Details to monitor the results. Approval does not advertise the prefix or activate traffic.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
