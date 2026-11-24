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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get Auto-Origin TLS KEX enrollment status for the given zone",
	usage:
		"$0 ssl auto-origin-tls-kex get\n\nWhen enabled, Cloudflare automatically selects the preferred TLS key-exchange algorithm to use when establishing the TLS connection to the zone's origin, picking from the algorithms permitted by the zone's `origin_tls_compliance_modes` setting. When disabled, the default key-exchange ordering is used.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
