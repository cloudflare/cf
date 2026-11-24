/**
 * populate command
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
	command: "populate",
	describe: "Rebuild dataset lookup lists",
	usage:
		"$0 cloudforce-one threat-intel datasets populate\n\nRebuilds the lists of attackers, categories, indicator types, and target industries for the account's datasets from their existing events. Datasets are processed in batches.",
	...parameters,
	loader: () => import("./populate.handler.js"),
});

export default command;
