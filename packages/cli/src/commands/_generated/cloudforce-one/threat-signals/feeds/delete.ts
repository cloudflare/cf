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
			placeholder: "feed-id",
			brief: "UUID of the Threat Signals feed",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <feed-id>",
	describe: "Delete Threat Signals feed",
	usage:
		"$0 cloudforce-one threat-signals feeds delete <feed-id>\n\nUnsubscribes the account from a Threat Signals feed and deletes its articles.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
