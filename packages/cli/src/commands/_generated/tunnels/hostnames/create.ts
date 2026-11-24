/**
 * create command
 * @generated from apis/overlays/tunnels.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		canonical: {
			kind: "boolean",
			brief:
				"Set to `true` to make the new hostname canonical, replacing any existing canonical hostname.\nIf `false` or omitted, the new hostname is canonical only if the tunnel has no active hostnames.\n",
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
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <tunnel-id>",
	describe: "Create a tunnel hostname",
	usage:
		"$0 tunnels hostnames create <tunnel-id>\n\nAssigns a hostname to a tunnel. If the tunnel has no active hostnames, the new hostname is always canonical.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
