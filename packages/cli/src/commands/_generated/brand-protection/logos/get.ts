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
		id: {
			kind: "parsed",
			brief:
				"ID of a logo query. When set, `result` is that single query object instead of an array.",
			optional: true,
			parse: String,
		},
		download: {
			kind: "parsed",
			brief:
				"Set to `true` to include each logo image as base64 data in `image_data`, with its MIME type in `content_type`.",
			optional: true,
			parse: String,
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
	describe: "List logo queries",
	usage:
		"$0 brand-protection logos get\n\nLists the account's saved logo queries. Set `id` to return a single query object instead of an array. Set `download=true` to include each logo image as base64 data.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
