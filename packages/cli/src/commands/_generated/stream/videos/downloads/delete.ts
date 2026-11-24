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
			placeholder: "download-type",
			brief: "The type of downloads available are: \`default\`, \`audio\`.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <download-type>",
	describe: "Delete download",
	usage:
		"$0 stream videos downloads delete <download-type>\n\nDelete specific type of download. For backwards-compatibility, DELETE requests to /downloads will delete the default download.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
