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
		"health-check-rate": {
			kind: "parsed",
			brief:
				"Magic WAN health check rate for tunnels created on this link. The default value is `mid`.",
			default: "mid",
			choices: ["low", "mid", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-rate", "text"),
		},
		"load-balance-inner-flows": {
			kind: "boolean",
			brief: "The load_balance_inner_flows field",
			default: true,
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
				"Provisioned download rate of the WAN circuit in kilobits per second.",
			optional: true,
			parse: Number,
		},
		"provisioned-upload-kbps": {
			kind: "parsed",
			brief:
				"Provisioned upload rate of the WAN circuit in kilobits per second.",
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
				"Gateway address for the secondary connector of a high availability site.",
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
	operands: [{ placeholder: "site-id", brief: "Identifier", parse: String }],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"static-addressing-address",
				"static-addressing-gateway-address",
				"static-addressing-secondary-address",
				"static-addressing-secondary-gateway-address",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"static-addressing-address",
					"static-addressing-gateway-address",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --static-addressing-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <site-id>",
	describe: "Create a new Site WAN",
	usage:
		"$0 magic-transit sites wans create <site-id>\n\nCreates a new Site WAN.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
