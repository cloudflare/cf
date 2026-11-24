/**
 * edit command
 * @generated from apis/overlays/cache.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"value-avif": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for avif.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-bmp": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for bmp.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-gif": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for gif.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-jp2": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for jp2.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-jpeg": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for jpeg.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-jpg": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for jpg.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-jpg2": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for jpg2.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-png": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for png.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-tif": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for tif.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-tiff": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for tiff.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-webp": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for webp.",
			variadic: true,
			optional: true,
			parse: String,
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
	command: "edit",
	describe: "Change variants setting",
	usage:
		"$0 cache settings variants edit\n\nVariant support enables caching variants of images with certain file extensions in addition to the original. This only applies when the origin server sends the 'Vary: Accept' response header. If the origin server sends 'Vary: Accept' but does not serve the variant requested, the response will not be cached. This will be indicated with BYPASS cache status in the response headers.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
