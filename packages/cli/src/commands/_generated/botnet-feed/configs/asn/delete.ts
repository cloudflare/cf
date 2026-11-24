/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "asn-id", brief: "Asn ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <asn-id>",
	describe: "Delete an ASN",
	usage:
		"$0 botnet-feed configs asn delete <asn-id>\n\nDelete an ASN from botnet threat feed for a given user.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
