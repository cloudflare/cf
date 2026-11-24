/**
 * delete command
 * @generated from apis/overlays/images.ts
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
	operands: [{ placeholder: "variant-id", brief: "Variant ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <variant-id>",
	describe: "Delete a variant",
	usage:
		"$0 images variants delete <variant-id>\n\nDelete a CF Images variant. This will purge the cache for all images associated with the variant.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
