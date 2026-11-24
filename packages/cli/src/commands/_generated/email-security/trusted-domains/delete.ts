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
			placeholder: "trusted-domain-id",
			brief: "Trusted domain identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <trusted-domain-id>",
	describe: "Delete a trusted email domain",
	usage:
		"$0 email-security trusted-domains delete <trusted-domain-id>\n\nRemoves a trusted domain pattern. After deletion, emails from this domain will be subject to normal recent domain and similarity checks.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
