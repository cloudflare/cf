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
		"excluded-account-id": {
			kind: "parsed",
			brief: "The account to exclude from the organization-targeted share.",
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
	command: "create <share-id>",
	describe: "Trigger an account exclusion from a share",
	usage:
		"$0 resource-sharing excluded-recipients create <share-id>\n\nExcludes a single account from an organization-targeted share. The share continues to target the entire organization, but the excluded account is skipped during reconciliation.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
