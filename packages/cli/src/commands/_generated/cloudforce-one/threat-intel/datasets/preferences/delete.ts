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
		scope: {
			kind: "enum",
			brief:
				"`user` removes your own default datasets. `account` removes the account's, and requires permission to edit the account's Cloudforce One settings.",
			values: ["user", "account"],
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Remove default datasets",
	usage:
		"$0 cloudforce-one threat-intel datasets preferences delete\n\nRemoves your default datasets (`scope` `user`) or the account's (`scope` `account`). After you remove your own, requests that omit `datasetId` use the account's default datasets, if set.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
