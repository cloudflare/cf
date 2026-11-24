/**
 * create command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"image-data": {
			kind: "parsed",
			brief:
				"Base64 encoded image data. Can include data URI prefix (e.g., 'data:image/png;base64,...') or just the base64 string. Supported formats: PNG, JPEG, GIF, WebP, BMP, and SVG. ICO is also accepted when the data includes a `data:image/x-icon;base64,` prefix.",
			optional: true,
			parse: String,
		},
		"search-lookback": {
			kind: "boolean",
			brief:
				"If true, also search previously scanned images for matches above the similarity threshold. Defaults to `true`.",
			default: true,
		},
		"similarity-threshold": {
			kind: "parsed",
			brief: "Minimum similarity score (0-1) required for visual matches",
			optional: true,
			parse: Number,
		},
		tag: {
			kind: "parsed",
			brief:
				"Name of the logo query. Must be unique among the account's logo queries.",
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
	command: "create",
	describe: "Create logo query",
	usage:
		"$0 brand-protection logos create\n\nUploads a logo and creates a saved logo query that finds visually similar images on scanned websites. The tag must be unique among the account's logo queries. By default, the new query also searches previously scanned images (see `search_lookback`). Creation fails when the account has reached its Brand Protection query limit, which counts domain and logo queries together.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
