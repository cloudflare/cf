/**
 * list command
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
	command: "list",
	describe: "List DNSSEC ZSKs",
	usage:
		"$0 dns dnssec zsks list\n\nList the Zone Signing Keys (ZSKs) that DNSSEC uses for the zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
