/**
 * create command
 * @generated from apis/overlays/diagnostics.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		colos: {
			kind: "parsed",
			brief:
				"If no source colo names specified, all colos will be used. China colos are unavailable for traceroutes.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"options-max-ttl": {
			kind: "parsed",
			brief: "Max TTL.",
			optional: true,
			parse: Number,
		},
		"options-packet-type": {
			kind: "parsed",
			brief: "Type of packet sent.",
			optional: true,
			choices: ["icmp", "tcp", "udp", "gre", "gre+icmp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "options-packet-type", "text"),
		},
		"options-packets-per-ttl": {
			kind: "parsed",
			brief: "Number of packets sent at each TTL.",
			optional: true,
			parse: Number,
		},
		"options-port": {
			kind: "parsed",
			brief:
				"For UDP and TCP, specifies the destination port. For ICMP, specifies the initial ICMP sequence value. Default value 0 will choose the best value to use for each protocol.",
			optional: true,
			parse: Number,
		},
		"options-wait-time": {
			kind: "parsed",
			brief: "Set the time (in seconds) to wait for a response to a probe.",
			optional: true,
			parse: Number,
		},
		targets: {
			kind: "parsed",
			brief: "The targets field",
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
	describe: "Traceroute",
	usage:
		"$0 diagnostics traceroutes create\n\nRun traceroutes from Cloudflare colos.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
