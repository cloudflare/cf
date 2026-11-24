/**
 * get command
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
	command: "get <language>",
	describe: "Return WebVTT captions for a provided language",
	usage:
		"$0 stream videos captions language vtt get <language>\n\nReturn WebVTT captions for a provided language.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
