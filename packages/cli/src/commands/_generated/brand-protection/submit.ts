/**
 * submit command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"show-historic": {
			kind: "parsed",
			brief:
				"Include scanned images without domain metadata (historic data). Default: false (only show images with domain)",
			optional: true,
			parse: String,
		},
		download: {
			kind: "parsed",
			brief: "If true, include base64-encoded image data in the response",
			optional: true,
			parse: String,
		},
		"image-data": {
			kind: "parsed",
			brief:
				"Base64 encoded image data. Can include data URI prefix (e.g., 'data:image/png;base64,...') or just the base64 string.",
			optional: true,
			parse: String,
		},
		"score-threshold": {
			kind: "parsed",
			brief: "Minimum similarity score threshold for matches (0-1, default: 0)",
			default: "0",
			parse: Number,
		},
		"top-k": {
			kind: "parsed",
			brief:
				"Number of closest matches to return. Defaults to 10. Accepts 1 to 100, but values above 50 are treated as 50.",
			default: "10",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "submit",
	describe: "Search scanned images",
	usage:
		"$0 brand-protection submit\n\nSubmit an image and find the n closest matches from the scanned images index without creating any match records. Returns similarity scores and metadata for each match.",
	...parameters,
	loader: () => import("./submit.handler.js"),
});

export default command;
