/**
 * generate command
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
	command: "generate <language>",
	describe: "Generate captions or subtitles for a provided language via AI",
	usage:
		"$0 stream videos captions language generate <language>\n\nGenerate captions or subtitles for provided language via AI.",
	...parameters,
	loader: () => import("./generate.handler.js"),
});

export default command;
