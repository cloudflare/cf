/**
 * delete command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"group-id": { kind: "parsed", brief: "Group ID", parse: String },
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
	operands: [{ placeholder: "member-id", brief: "Member ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <member-id>",
	describe: "Remove an account from a group",
	usage:
		"$0 cloudforce-one threat-intel datasets access groups members delete <member-id>\n\nRemoves an account from an account group.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
