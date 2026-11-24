/**
 * edit command
 * @generated from apis/overlays/tunnels.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			parse: String,
		},
		canonical: {
			kind: "boolean",
			brief:
				"Makes this hostname canonical. `false` is not accepted; make a different hostname canonical to unset this one.",
			optional: true,
		},
		hostname: {
			kind: "parsed",
			brief:
				"A single DNS label assigned to the tunnel. The value is normalized to lowercase and may contain only letters, digits, and internal hyphens.",
			optional: true,
			parse: String,
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
	operands: [
		{
			placeholder: "hostname-id",
			brief: "UUID of the tunnel hostname.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <hostname-id>",
	describe: "Update a tunnel hostname",
	usage:
		"$0 tunnels hostnames edit <hostname-id>\n\nUpdates the hostname value or makes it canonical. To unset a canonical hostname, make a different hostname canonical instead.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
