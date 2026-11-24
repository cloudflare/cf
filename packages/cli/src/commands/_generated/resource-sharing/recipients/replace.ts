/**
 * replace command
 * @generated from apis/overlays/resource-sharing.ts
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "share-id", brief: "Share identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "replace <share-id>",
	describe: "Trigger recipient reconciliation on a share",
	usage:
		"$0 resource-sharing recipients replace <share-id>\n\nReplaces the full recipient list for an account-targeted share. The server computes the diff between the current and desired recipients: new accounts are added, accounts no longer in the list are marked for disassociation, and unchanged accounts are left as-is. Returns an error if the share targets an organization (`target_type=organization`) and the list is non-empty; org-targeted shares derive their recipients dynamically from org membership and cannot be modified through this endpoint.",
	...parameters,
	loader: () => import("./replace.handler.js"),
});

export default command;
