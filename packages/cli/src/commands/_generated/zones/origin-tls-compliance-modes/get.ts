/**
 * get command
 * @generated from apis/overlays/zones.ts
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
	describe: "Get Origin TLS Compliance Modes setting",
	usage:
		"$0 zones origin-tls-compliance-modes get\n\nOrigin TLS Compliance Modes constrains the set of TLS key-exchange algorithms Cloudflare may use when establishing the TLS connection to the zone's origin. The value is a list of named compliance modes (currently `fips` and `pqh`). Multiple modes are combined as the intersection of their permitted algorithm lists. An empty list (or no rule configured) means no compliance constraint is applied.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
