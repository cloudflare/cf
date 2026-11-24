/**
 * delete command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		identifier: {
			kind: "parsed",
			brief: "A Cloudflare-generated unique identifier for a media item.",
			parse: String,
		},
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
	operands: [
		{
			placeholder: "language",
			brief: "The language tag in BCP 47 format.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <language>",
	describe: "Delete captions or subtitles",
	usage:
		"$0 stream videos captions language delete <language>\n\nRemoves the captions or subtitles from a video.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
