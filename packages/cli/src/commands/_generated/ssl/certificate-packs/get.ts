/**
 * get command
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
	command: "get <certificate-pack-id>",
	describe: "Get Certificate Pack",
	usage:
		"$0 ssl certificate-packs get <certificate-pack-id>\n\nFor a given zone, get a certificate pack.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
