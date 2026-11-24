/**
 * edit command
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
		"site-id": { kind: "parsed", brief: "Identifier", parse: String },
		"health-check-rate": {
			kind: "parsed",
			brief: "Magic WAN health check rate for tunnels created on this link.",
			optional: true,
			choices: ["low", "mid", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-rate", "text"),
		},
		"load-balance-inner-flows": {
			kind: "boolean",
			brief: "The load_balance_inner_flows field",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		physport: {
			kind: "parsed",
			brief: "The physport field",
			optional: true,
			parse: Number,
		},
		priority: {
			kind: "parsed",
			brief: "The priority field",
			optional: true,
			parse: Number,
		},
		"provisioned-download-kbps": {
			kind: "parsed",
			brief:
				"Provisioned download rate of the WAN circuit in kilobits per second. Set to null to remove it.",
			optional: true,
			parse: Number,
		},
		"provisioned-upload-kbps": {
			kind: "parsed",
			brief:
				"Provisioned upload rate of the WAN circuit in kilobits per second. Set to null to remove it.",
			optional: true,
			parse: Number,
		},
		"static-addressing-address": {
			kind: "parsed",
			brief: "A valid CIDR notation representing an IP range.",
			optional: true,
			parse: String,
		},
		"static-addressing-gateway-address": {
			kind: "parsed",
			brief: "A valid IPv4 address.",
			optional: true,
			parse: String,
		},
		"static-addressing-secondary-address": {
			kind: "parsed",
			brief: "A valid CIDR notation representing an IP range.",
			optional: true,
			parse: String,
		},
		"static-addressing-secondary-gateway-address": {
			kind: "parsed",
			brief:
				"Gateway address for the secondary connector of a high availability site. Set to null to remove it.",
			optional: true,
			parse: String,
		},
		"vlan-tag": {
			kind: "parsed",
			brief: "VLAN ID. Use zero for untagged.",
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
	operands: [{ placeholder: "wan-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <wan-id>",
	describe: "Patch Site WAN",
	usage:
		"$0 magic-transit sites wans edit <wan-id>\n\nPatch a specific Site WAN.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
