/**
 * validate-hostname command
 * @generated from apis/overlays/rum.ts
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
	},
	operands: [
		{
			placeholder: "hostname",
			brief:
				"The hostname to validate (e.g. example.com). The \`pattern\` below validates the hostname's structure (label syntax) only. In addition, the hostname must end in a valid public suffix (TLD). For the list of valid suffixes and how it is used, see the Public Suffix List: https://wiki.mozilla.org/Public_Suffix_List/Use_Cases",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "validate-hostname <hostname>",
	describe: "Validate a Web Analytics site hostname",
	usage:
		"$0 rum site-info validate-hostname <hostname>\n\nValidates that the provided hostname is well-formed, does not contain wildcards, and has a valid TLD. Returns an empty result on success.",
	...parameters,
	loader: () => import("./validate-hostname.handler.js"),
});

export default command;
