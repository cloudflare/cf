/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"client-default": {
			kind: "boolean",
			brief: "Indicate whether this location is the default location.",
			default: false,
		},
		"dns64-enabled": {
			kind: "boolean",
			brief:
				"Enable DNS64 synthesis for DNS queries matched to this location. When updating a location, omitting this field resets it to false.",
			default: false,
		},
		"dns-destination-ips-id": {
			kind: "parsed",
			brief:
				"Specify the identifier of the pair of IPv4 addresses assigned to this location. When creating a location, if this field is absent or set to null, the pair of shared IPv4 addresses (0e4a32c6-6fb8-4858-9296-98f51631e8e6) is auto-assigned. When updating a location, if this field is absent or set to null, the pre-assigned pair remains unchanged.",
			optional: true,
			parse: String,
		},
		"ecs-support": {
			kind: "boolean",
			brief: "Indicate whether the location must resolve EDNS queries.",
			default: false,
		},
		"endpoints-doh-enabled": {
			kind: "boolean",
			brief: "Indicate whether the DOH endpoint is enabled for this location.",
			optional: true,
		},
		"endpoints-doh-networks": {
			kind: "parsed",
			brief:
				'Specify the list of allowed source IP network ranges for this endpoint. When the list is empty, the endpoint allows all source IPs. The list takes effect only if the endpoint is enabled for this location. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"network": string}].',
			optional: true,
			parse: String,
		},
		"endpoints-doh-require-token": {
			kind: "boolean",
			brief:
				"Specify whether the DOH endpoint requires user identity authentication.",
			optional: true,
		},
		"endpoints-dot-enabled": {
			kind: "boolean",
			brief: "Indicate whether the DOT endpoint is enabled for this location.",
			optional: true,
		},
		"endpoints-dot-networks": {
			kind: "parsed",
			brief:
				'Specify the list of allowed source IP network ranges for this endpoint. When the list is empty, the endpoint allows all source IPs. The list takes effect only if the endpoint is enabled for this location. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"network": string}].',
			optional: true,
			parse: String,
		},
		"endpoints-ipv4-enabled": {
			kind: "boolean",
			brief: "Indicate whether the IPv4 endpoint is enabled for this location.",
			optional: true,
		},
		"endpoints-ipv6-enabled": {
			kind: "boolean",
			brief: "Indicate whether the IPV6 endpoint is enabled for this location.",
			optional: true,
		},
		"endpoints-ipv6-networks": {
			kind: "parsed",
			brief:
				'Specify the list of allowed source IPv6 network ranges for this endpoint. When the list is empty, the endpoint allows all source IPs. The list takes effect only if the endpoint is enabled for this location. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"network": string}].',
			optional: true,
			parse: String,
		},
		"max-ttl-mode": {
			kind: "parsed",
			brief:
				"`inherit` uses the account `max_ttl_secs`. `override` uses this location's `ttl_secs`. `disabled` leaves returned TTLs unchanged.",
			optional: true,
			choices: ["inherit", "override", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "max-ttl-mode", "text"),
		},
		"max-ttl-ttl-secs": {
			kind: "parsed",
			brief:
				"Location-specific cap on DNS response TTLs, in seconds. Required when `mode` is `override`. Must be omitted when `mode` is `inherit` or `disabled`.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "Specify the location name.",
			optional: true,
			parse: String,
		},
		networks: {
			kind: "parsed",
			brief:
				'Specify the list of network ranges from which requests at this location originate. The list takes effect only if it is non-empty and the IPv4 endpoint is enabled for this location. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"network": string}].',
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
		rules.check((argv) => {
			const groupSet = ["max-ttl-mode", "max-ttl-ttl-secs"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["max-ttl-mode"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --max-ttl-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a Zero Trust Gateway location",
	usage:
		"$0 zero-trust gateway locations create\n\nCreate a new Zero Trust Gateway location.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
