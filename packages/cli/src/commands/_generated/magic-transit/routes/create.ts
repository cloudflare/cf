/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "An optional human provided description of the static route.",
			optional: true,
			parse: String,
		},
		nexthop: {
			kind: "parsed",
			brief: "The next-hop IP Address for the static route.",
			optional: true,
			parse: String,
		},
		prefix: {
			kind: "parsed",
			brief: "IP Prefix in Classless Inter-Domain Routing format.",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief: "Priority of the static route.",
			optional: true,
			parse: Number,
		},
		"scope-colo-names": {
			kind: "parsed",
			brief: "List of colo names for the ECMP scope.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"scope-colo-regions": {
			kind: "parsed",
			brief: "List of colo regions for the ECMP scope.",
			variadic: true,
			optional: true,
			parse: String,
		},
		weight: {
			kind: "parsed",
			brief: "Optional weight of the ECMP scope - if provided.",
			optional: true,
			parse: Number,
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
	describe: "Create a Route",
	usage:
		"$0 magic-transit routes create\n\nCreates a new Magic static route. Use `?validate_only=true` as an optional query parameter to run validation only without persisting changes.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
