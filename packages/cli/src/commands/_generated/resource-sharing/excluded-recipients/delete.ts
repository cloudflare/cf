/**
 * delete command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"share-id": {
			kind: "parsed",
			brief: "Share identifier tag.",
			parse: String,
		},
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
			placeholder: "excluded-recipient-id",
			brief: "Share Excluded Recipient identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <excluded-recipient-id>",
	describe: "Trigger an account un-exclusion from a share",
	usage:
		"$0 resource-sharing excluded-recipients delete <excluded-recipient-id>\n\nRemoves a single account from a share's excluded-recipient list. The account becomes eligible to receive the share again on the next reconciliation cycle.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
