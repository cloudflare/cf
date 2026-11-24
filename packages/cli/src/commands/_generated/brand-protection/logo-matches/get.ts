/**
 * get command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		offset: {
			kind: "parsed",
			brief: "Number of matches to skip, for pagination. Defaults to 0.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of matches to return. Defaults to 50.",
			optional: true,
			parse: String,
		},
		"query-id": {
			kind: "parsed",
			brief: "ID of the logo query whose matches to list.",
			parse: String,
		},
		download: {
			kind: "parsed",
			brief:
				"Set to `true` to include each matched image as base64 data in `image_data`, with its MIME type in `content_type`.",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to sort by: `matchedAt`, `domain`, `similarityScore`, or `registrar`. Defaults to `matchedAt`.",
			values: ["matchedAt", "domain", "similarityScore", "registrar"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Sort direction: `asc` or `desc`. Defaults to `desc`.",
			values: ["asc", "desc"],
			optional: true,
		},
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
	command: "get",
	describe: "List logo matches",
	usage:
		"$0 brand-protection logo-matches get\n\nLists images that matched a saved logo query, most recently matched first by default. Set `download=true` to include each matched image as base64 data.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
