/**
 * update command
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Create or replace the organization profile",
	usage:
		"$0 cloudforce-one priority-intelligence profile update\n\nCreates or replaces the account's organization profile: who the organization is, such as its name, brands, domains, sector, regions, key systems and suppliers. All of the account's Priority Intelligence Requirements share it. An account has at most one profile, and it does not count against the PIR quota. Send structured `organization` facts, which structured PIRs inherit and from which the profile text is generated, or free `profile` text. `revision` must match the stored profile's, or 0 when there is none; it is required with `organization`. Free `profile` text cannot replace structured facts; delete the profile first to switch back.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
