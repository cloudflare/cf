/**
 * full-report command
 * @generated from apis/overlays/botnet-feed.ts
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
	operands: [{ placeholder: "asn-id", brief: "Asn ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "full-report <asn-id>",
	describe: "Get full report",
	usage:
		"$0 botnet-feed asn full-report <asn-id>\n\nGets all the data the botnet threat feed tracking database has for a given ASN registered to user account.",
	...parameters,
	loader: () => import("./full-report.handler.js"),
});

export default command;
