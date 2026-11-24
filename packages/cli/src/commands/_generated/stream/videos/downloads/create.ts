/**
 * create command
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
			placeholder: "download-type",
			brief: "The type of downloads available are: \`default\`, \`audio\`.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <download-type>",
	describe: "Create download",
	usage:
		"$0 stream videos downloads create <download-type>\n\nCreates a download for a video of specified type. For backwards-compatibility, POST requests to /downloads will enable the default download.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
