/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"dataset-ids": {
			kind: "parsed",
			brief:
				"The dataset UUIDs to use when a request omits `datasetId`: 1 to 50 datasets you can read, either all analytics datasets or all intelligence datasets. Duplicates are ignored.",
			variadic: true,
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief:
				"`user` sets your own default datasets. `account` sets the default datasets for everyone in the account who has not set their own, and requires permission to edit the account's Cloudforce One settings.",
			optional: true,
			choices: ["user", "account"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope", "text"),
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Set default datasets",
	usage:
		"$0 cloudforce-one threat-intel datasets preferences update\n\nSets the datasets to use when a request omits `datasetId`, for you (`scope` `user`) or for the account (`scope` `account`). Your own default datasets take precedence over the account's. Every dataset must exist and be readable by the account, and the list cannot mix analytics and intelligence datasets.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
