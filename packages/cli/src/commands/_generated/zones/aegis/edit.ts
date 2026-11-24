/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"value-enabled": {
			kind: "boolean",
			brief: "Whether the feature is enabled or not.",
			optional: true,
		},
		"value-pool-id": {
			kind: "parsed",
			brief:
				"Egress pool id which refers to a grouping of dedicated egress IPs through which Cloudflare will connect to origin.",
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
	command: "edit",
	describe: "Change aegis setting",
	usage:
		"$0 zones aegis edit\n\nAegis provides dedicated egress IPs (from Cloudflare to your origin) for your layer 7 WAF and CDN services. The egress IPs are reserved exclusively for your account so that you can increase your origin security by only allowing traffic from a small list of IP addresses.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
