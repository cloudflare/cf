/**
 * edit command
 * @generated from apis/overlays/images.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"never-require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates whether the variant can access an image without a signature, regardless of image access control.",
			optional: true,
		},
		"options-fit": {
			kind: "parsed",
			brief:
				"The fit property describes how the width and height dimensions should be interpreted.",
			optional: true,
			choices: ["scale-down", "contain", "cover", "crop", "pad"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "options-fit", "text"),
		},
		"options-height": {
			kind: "parsed",
			brief: "Maximum height in image pixels.",
			optional: true,
			parse: Number,
		},
		"options-metadata": {
			kind: "parsed",
			brief: "What EXIF data should be preserved in the output image.",
			optional: true,
			choices: ["keep", "copyright", "none"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "options-metadata", "text"),
		},
		"options-width": {
			kind: "parsed",
			brief: "Maximum width in image pixels.",
			optional: true,
			parse: Number,
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
	operands: [{ placeholder: "variant-id", brief: "Variant ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <variant-id>",
	describe: "Update a variant",
	usage:
		"$0 images variants edit <variant-id>\n\nUpdate a CF Images variant. This will purge the cache for all images associated with the variant.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
