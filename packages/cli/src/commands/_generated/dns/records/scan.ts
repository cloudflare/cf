/**
 * scan command
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
	command: "scan",
	describe: "Scan DNS Records",
	usage:
		"$0 dns records scan\n\nScan for common DNS records on your domain and automatically add them to your zone. Useful if you haven't updated your nameservers yet.",
	...parameters,
	loader: () => import("./scan.handler.js"),
});

export default command;
