/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "Description of the filter profile",
			default: "",
			parse: String,
		},
		"match-action": {
			kind: "parsed",
			brief:
				"Action to take when a route matches one of the targets in this profile",
			optional: true,
			choices: ["allow", "deny"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "match-action", "text"),
		},
		name: {
			kind: "parsed",
			brief: "Friendly name for the filter profile",
			optional: true,
			parse: String,
		},
		targets: {
			kind: "parsed",
			brief:
				"List of CIDR prefixes. Each entry may carry an optional suffix that specifies which prefix lengths to match relative to the prefix length N: '{X,Y}' matches prefix lengths in the inclusive range [X, Y] where N <= X <= Y <= max (max is 32 for IPv4, 128 for IPv6), '{X}' matches exactly length X (equivalent to {X,X}), '+' is shorthand for {N, max} (the prefix and all more-specific subnets, including at length N itself; valid even when N is the maximum length). Omit the suffix to match the prefix exactly at length N.",
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
	command: "create",
	describe: "Create BGP Filter Profile",
	usage:
		"$0 magic-transit bgp-filter-profiles create\n\nCreates a new BGP filter profile for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
