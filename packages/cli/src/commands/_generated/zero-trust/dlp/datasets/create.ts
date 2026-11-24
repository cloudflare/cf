/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"case-sensitive": {
			kind: "boolean",
			brief:
				"Only applies to custom word lists.\nDetermines if the words should be matched in a case-sensitive manner\nCannot be set to false if `secret` is true or undefined",
			optional: true,
		},
		description: {
			kind: "parsed",
			brief: "The description of the dataset.",
			optional: true,
			parse: String,
		},
		"encoding-version": {
			kind: "parsed",
			brief:
				"Dataset encoding version\n\nNon-secret custom word lists with no header are always version 1.\nSecret EDM lists with no header are version 1.\nMulticolumn CSV with headers are version 2.\nOmitting this field provides the default value 0, which is interpreted\nthe same as 1.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		secret: {
			kind: "boolean",
			brief:
				"Generate a secret dataset.\n\nIf true, the response will include a secret to use with the EDM encoder.\nIf false, the response has no secret and the dataset is uploaded in plaintext.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Dataset description.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a new dataset",
	usage:
		"$0 zero-trust dlp datasets create\n\nCreates a new DLP (Data Loss Prevention) dataset for storing custom detection patterns. Datasets can contain exact match data, word lists, or EDM (Exact Data Match) configurations.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
