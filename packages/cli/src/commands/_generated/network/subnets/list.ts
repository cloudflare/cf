/**
 * list command
 * @generated from apis/overlays/network.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "If set, only list subnets with the given name",
			optional: true,
			parse: String,
		},
		comment: {
			kind: "parsed",
			brief: "If set, only list subnets with the given comment.",
			optional: true,
			parse: String,
		},
		network: {
			kind: "parsed",
			brief:
				"If set, only list the subnet whose network exactly matches the given CIDR.",
			optional: true,
			parse: String,
		},
		"existed-at": {
			kind: "parsed",
			brief:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
			optional: true,
			parse: String,
		},
		"address-family": {
			kind: "enum",
			brief:
				"If set, only include subnets in the given address family - `v4` or `v6`",
			values: ["v4", "v6"],
			optional: true,
		},
		"is-default-network": {
			kind: "boolean",
			brief:
				"If `true`, only include default subnets. If `false`, exclude default subnets subnets. If not set, all subnets will be included.",
			optional: true,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only include deleted subnets. If `false`, exclude deleted subnets. If not set, all subnets will be included.",
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief:
				"Sort order of the results. `asc` means oldest to newest, `desc` means newest to oldest. If not set, they will not be in any particular order.",
			values: ["asc", "desc"],
			optional: true,
		},
		"subnet-types": {
			kind: "enum",
			brief: "If set, the types of subnets to include, separated by comma.",
			values: ["cloudflare_source", "initial_resolved_ip", "warp"],
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to display.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
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
	describe: "List Subnets",
	usage: "$0 network subnets list\n\nLists and filters subnets in an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
