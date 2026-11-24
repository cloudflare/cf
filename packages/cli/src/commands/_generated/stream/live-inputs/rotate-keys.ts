/**
 * rotate-keys command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
			placeholder: "live-input-identifier",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "rotate-keys <live-input-identifier>",
	describe: "Rotate keys for a live input",
	usage:
		"$0 stream live-inputs rotate-keys <live-input-identifier>\n\nRotates the credentials for a live input without changing its identifier. Old credentials are revoked, broadcasts using stale credentials are automatically disconnected shortly after rotation, and the response returns refreshed credentials.",
	...parameters,
	loader: () => import("./rotate-keys.handler.js"),
});

export default command;
