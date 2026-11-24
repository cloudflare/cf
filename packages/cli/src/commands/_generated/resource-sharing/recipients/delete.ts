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
			placeholder: "recipient-id",
			brief: "Share Recipient identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <recipient-id>",
	describe: "Trigger a recipient removal from a share",
	usage:
		"$0 resource-sharing recipients delete <recipient-id>\n\nPerforms a **soft delete**: sets the recipient's `desired_association_status` to `disassociated`, which signals the background reconciliation workflow (Temporal) to remove the shared resources from the recipient account. The recipient record remains in the database for audit purposes and is still returned by `GET /accounts/{account_id}/shares/{share_id}/recipients` with its updated status. Resource access is not fully removed until the workflow completes and `current_association_status` transitions to `disassociated`. The recipient record itself is never physically deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
