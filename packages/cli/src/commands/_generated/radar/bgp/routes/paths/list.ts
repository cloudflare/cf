/**
 * list command
 * @generated from apis/overlays/radar.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		asn: {
			kind: "parsed",
			brief: "Single Autonomous System Number (ASN) as integer.",
			parse: String,
		},
		"ip-version": {
			kind: "enum",
			brief: "Address family of the observed paths. Defaults to IPv4.",
			values: ["IPv4", "IPv6"],
			optional: true,
		},
		collector: {
			kind: "parsed",
			brief:
				'Scope to a single RouteViews collector (e.g. "route-views3"). Omit to merge across all active collectors (identical path segments are deduplicated, observation counts summed, and every contributing collector listed).',
			optional: true,
			parse: String,
		},
		format: {
			kind: "enum",
			brief: "Format in which results will be returned.",
			values: ["JSON", "CSV"],
			optional: true,
		},
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
	command: "list",
	describe: "Get tier-1 path segments for an AS",
	usage:
		'$0 radar bgp routes paths list\n\nRetrieves the paths an AS uses to reach the tier-1 clique, derived from RouteViews RIB snapshots. Each entry is an ordered AS-path segment (from the queried AS toward a tier-1) with the number of observed paths and peers, and the collectors that observed it. By default segments are merged across all active collectors; pass "collector" to scope to one. The response also includes an "asnInfo" map (keyed by ASN) with the name and country for every ASN in the returned segments plus the queried ASN (best-effort; null when unavailable).',
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
