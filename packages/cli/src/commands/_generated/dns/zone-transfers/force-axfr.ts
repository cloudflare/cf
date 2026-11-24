/**
 * force-axfr command
 * @generated from apis/overlays/dns.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "force-axfr",
	describe: "Force AXFR",
	usage:
		"$0 dns zone-transfers force-axfr\n\nSends AXFR zone transfer request to primary nameserver(s).",
	...parameters,
	loader: () => import("./force-axfr.handler.js"),
});

export default command;
