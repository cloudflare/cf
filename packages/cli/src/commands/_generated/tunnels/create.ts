/**
 * create command
 * @generated from apis/overlays/tunnels.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"config-source": {
			kind: "parsed",
			brief:
				"Indicates if this is a locally or remotely configured tunnel. If `local`, manage the tunnel using a YAML file on the origin machine. If `cloudflare`, manage the tunnel on the Zero Trust dashboard.",
			optional: true,
			choices: ["local", "cloudflare"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "config-source", "text"),
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for a tunnel.",
			optional: true,
			parse: String,
		},
		"tunnel-secret": {
			kind: "parsed",
			brief:
				"Sets the password required to run a locally-managed tunnel. Must be at least 32 bytes and encoded as a base64 string.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a Cloudflare Tunnel",
	usage:
		"$0 tunnels create\n\nCreates a remotely or locally managed Cloudflare Tunnel in an account. After creation, retrieve its token and run cloudflared to establish the connector connection.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
