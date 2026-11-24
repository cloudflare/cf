/**
 * delete command
 * @generated from apis/overlays/ssl.ts
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
			placeholder: "certificate-pack-id",
			brief: "The unique identifier for a certificate_pack.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <certificate-pack-id>",
	describe: "Delete Advanced Certificate Manager Certificate Pack",
	usage:
		"$0 ssl certificate-packs delete <certificate-pack-id>\n\nFor a given zone, delete an advanced certificate pack.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
