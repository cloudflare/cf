/**
 * create command
 * @generated from apis/overlays/network-interconnects.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		account: {
			kind: "parsed",
			brief: "The account field",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			parse: String,
		},
		"slot-id": {
			kind: "parsed",
			brief: "The slot_id field",
			optional: true,
			parse: String,
		},
		speed: {
			kind: "parsed",
			brief: "The speed field",
			optional: true,
			parse: String,
		},
		bandwidth: {
			kind: "parsed",
			brief: "Bandwidth structure as visible through the customer-facing API.",
			optional: true,
			choices: [
				"50M",
				"100M",
				"200M",
				"300M",
				"400M",
				"500M",
				"1G",
				"2G",
				"5G",
				"10G",
				"20G",
				"50G",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "bandwidth", "text"),
		},
		"pairing-key": {
			kind: "parsed",
			brief: "Pairing key provided by GCP",
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
	rules(rules) {
		rules.conflicts("slot-id", ["bandwidth", "pairing-key"]);
		rules.conflicts("speed", ["bandwidth", "pairing-key"]);
		rules.implies("speed", ["slot-id"]);
		rules.conflicts("bandwidth", ["slot-id", "speed"]);
		rules.implies("bandwidth", ["pairing-key"]);
		rules.conflicts("pairing-key", ["slot-id", "speed"]);
		rules.implies("pairing-key", ["bandwidth"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a new interconnect",
	usage:
		"$0 network-interconnects interconnects create\n\nCreates a new network interconnect for connecting Cloudflare's network to external networks. Interconnects provide dedicated bandwidth and reduced latency for traffic exchange.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
