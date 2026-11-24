/**
 * delete command
 * @generated from apis/overlays/email-security.ts
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
			placeholder: "sending-domain-restriction-id",
			brief: "Sending domain restriction identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <sending-domain-restriction-id>",
	describe: "Delete a sending domain restriction",
	usage:
		"$0 email-security sending-domain-restrictions delete <sending-domain-restriction-id>\n\nRemoves a sending domain restriction. After deletion, TLS will no longer be enforced for emails from this domain.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
