/**
 * update command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cf-async-upload": {
			kind: "parsed",
			brief:
				"Set to the literal value `1` to enqueue the upload and receive a\n`202` response with a polling URL. Any other value uses the legacy\nsynchronous response.",
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief:
				"The file to upload. Either a plain STIX2/CRDF body or a gzipped one (recognised by `0x1f 0x8b` magic bytes or a `.gz` filename suffix). ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "feed-id", brief: "Indicator feed ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <feed-id>",
	describe: "Update indicator feed data",
	usage:
		"$0 intel indicator-feeds snapshots update <feed-id>\n\nRevises the raw data entries in a custom threat indicator feed. Accepts both plain and gzipped STIX2/CRDF bodies. Gzip is detected by RFC 1952 magic bytes (`0x1f 0x8b`) and/or a `.gz` filename suffix (case-insensitive) — either signal alone is sufficient to trigger the gzip path; if the body is not valid gzip, the upload fails fast. Customers are encouraged to gzip larger uploads — the api-gateway 500 MB body cap applies to the on-the-wire (compressed) size, so gzip lets a single upload carry several GiB of decompressed STIX.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
