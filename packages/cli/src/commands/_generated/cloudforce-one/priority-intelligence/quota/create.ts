/**
 * create command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Get PIR quota for an account",
	usage:
		"$0 cloudforce-one priority-intelligence quota create\n\nReturns the account's PIR quota. `quota` and `remaining` count active PIRs against the entitlement limit; moving a PIR to draft or deleting it frees its slot. `total_quota` and `total_remaining` count every PIR, drafts included, against five times the limit. Anniversary dates are informational.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
