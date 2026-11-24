/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "dex-test-id",
			brief: "Unique identifier for a DEX test.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <dex-test-id>",
	describe: "Delete Device DEX test",
	usage:
		"$0 zero-trust dex tests delete <dex-test-id>\n\nDelete a Device DEX test. Returns the remaining device dex tests for the account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
