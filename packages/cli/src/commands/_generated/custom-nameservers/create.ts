/**
 * create command
 * @generated from apis/overlays/custom-nameservers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"ns-name": {
			kind: "parsed",
			brief: "The FQDN of the name server.",
			optional: true,
			parse: String,
		},
		"ns-set": {
			kind: "parsed",
			brief: "The number of the set that this name server belongs to.",
			default: "1",
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Add account or zone Custom Nameserver",
	usage:
		"$0 custom-nameservers create\n\nAdds a custom nameserver to the account or zone for use as a vanity nameserver on zones.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
