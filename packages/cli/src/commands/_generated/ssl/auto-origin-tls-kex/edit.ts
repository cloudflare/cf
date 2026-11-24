/**
 * edit command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief:
				"Controls enablement of Auto-Origin TLS KEX selection for the zone.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Update enablement of Auto-Origin TLS KEX selection.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Patch Auto-Origin TLS KEX enrollment status for the given zone",
	usage:
		'$0 ssl auto-origin-tls-kex edit\n\nEnable or disable Auto-Origin TLS KEX selection for the zone by sending `{"enabled": true}` or `{"enabled": false}`. When enabled, Cloudflare runs a periodic scan of the zone\'s origins to determine the preferred key-exchange algorithm and writes that preference to the edge so it is sent first in the TLS ClientHello to the origin.',
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
