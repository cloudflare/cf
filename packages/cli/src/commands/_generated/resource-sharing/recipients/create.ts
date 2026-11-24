/**
 * create command
 * @generated from apis/overlays/resource-sharing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"recipient-account-id": {
			kind: "parsed",
			brief: "The account that will receive the share.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Specify the account receiving the share using `recipient_account_id`. The legacy field `account_id` is accepted as a synonym during the deprecation period (see `x-sunset` on that field). ",
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
	command: "create <share-id>",
	describe: "Trigger a recipient addition to a share",
	usage:
		"$0 resource-sharing recipients create <share-id>\n\nAdds a single recipient to an account-targeted resource share, granting them access to the shared resources. The recipient account must belong to the same organization as the share owner. To replace the entire recipient list in one call, use `PUT /accounts/{account_id}/shares/{share_id}/recipients` instead.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
