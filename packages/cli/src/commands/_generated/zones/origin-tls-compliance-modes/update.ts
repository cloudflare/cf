/**
 * update command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		value: {
			kind: "parsed",
			brief:
				"List of TLS compliance modes that constrain the key-exchange algorithms Cloudflare may use when establishing the TLS connection to the zone's origin. Currently supported values are `fips` (FIPS-approved curves) and `pqh` (post-quantum hybrid). Future modes (e.g. `cnsa2`) may be added; clients should treat unknown values as opaque strings. Multiple modes are combined as the intersection of their permitted algorithm lists; selections whose intersection is empty are rejected. An empty list clears the constraint.",
			variadic: true,
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
	command: "update",
	describe: "Replace Origin TLS Compliance Modes setting",
	usage:
		'$0 zones origin-tls-compliance-modes update\n\nReplace the entire set of TLS compliance modes for the zone with the list provided in the request body. PUT performs a full replace, not a merge — any modes not present in the request body are removed. The request body must be of the form `{"value": ["fips", "pqh"]}`. Currently supported modes are `fips` and `pqh`; an empty list clears the constraint. Future modes (e.g. `cnsa2`) may be added; clients should treat unknown values as opaque strings. Invalid mode values are rejected with a 4xx response.',
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
