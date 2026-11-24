/**
 * force-notify command
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
	command: "force-notify",
	describe: "Force DNS NOTIFY",
	usage:
		"$0 dns zone-transfers outgoing force-notify\n\nNotifies the secondary nameserver(s) and clears IXFR backlog of primary zone.",
	...parameters,
	loader: () => import("./force-notify.handler.js"),
});

export default command;
