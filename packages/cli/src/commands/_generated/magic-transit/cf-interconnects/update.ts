/**
 * update command
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
		"x-magic-new-hc-target": {
			kind: "parsed",
			brief:
				"If true, the health check target in the request and response bodies will be presented using the new object format. Defaults to false.",
			optional: true,
			parse: String,
		},
		"automatic-return-routing": {
			kind: "boolean",
			brief:
				"True if automatic stateful return routing should be enabled for a tunnel, false otherwise. Requires the `coupler_integration` account flag to be enabled; requests setting this to `true` without that flag will be rejected.",
			optional: true,
		},
		"bgp-as-no": {
			kind: "parsed",
			brief: "Deprecated. Use customer_asn.",
			optional: true,
			parse: Number,
		},
		"bgp-cloudflare-endpoint": {
			kind: "parsed",
			brief: "Read-only for v1.5; derived from interface_address.",
			optional: true,
			parse: String,
		},
		"bgp-customer-asn": {
			kind: "parsed",
			brief: "ASN used on the customer end of the BGP session.",
			optional: true,
			parse: Number,
		},
		"bgp-customer-endpoint": {
			kind: "parsed",
			brief: "Read-only for v1.5; derived from interface_address.",
			optional: true,
			parse: String,
		},
		"bgp-export-filter-id": {
			kind: "parsed",
			brief:
				"ID of the BGP filter profile applied to routes advertised to the customer.",
			optional: true,
			parse: String,
		},
		"bgp-extra-prefixes": {
			kind: "parsed",
			brief:
				"IPv4 prefixes in this list will be advertised to the customer device, in addition to the routes in the Magic\nrouting table. Each entry must be a network address in CIDR notation with no host bits set (for example\n`192.0.2.0/24`, not `192.0.2.1/24`) and must not repeat another entry.\n",
			variadic: true,
			optional: true,
			parse: String,
		},
		"bgp-import-filter-id": {
			kind: "parsed",
			brief:
				"ID of the BGP filter profile applied to routes received from the customer.",
			optional: true,
			parse: String,
		},
		"bgp-md5-key": {
			kind: "parsed",
			brief:
				"MD5 key to use for session authentication.\n\nNote that *this is not a security measure*. MD5 is not a valid security mechanism, and the\nkey is not treated as a secret value. This is *only* supported for preventing\nmisconfiguration, not for defending against malicious attacks.\n\nThe MD5 key, if set, must be of non-zero length and consist only of the following types of\ncharacter:\n\n* ASCII alphanumerics: `[a-zA-Z0-9]`\n* Special characters in the set `'!@#$%^&*()+[]{}<>/.,;:_-~`= \\|`\n\nIn other words, MD5 keys may contain any printable ASCII character aside from newline (0x0A),\nquotation mark (`\"`), vertical tab (0x0B), carriage return (0x0D), tab (0x09), form feed\n(0x0C), and the question mark (`?`). Requests specifying an MD5 key with one or more of\nthese disallowed characters will be rejected.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "An optional description of the interconnect.",
			optional: true,
			parse: String,
		},
		"gre-cloudflare-endpoint": {
			kind: "parsed",
			brief:
				"The IP address assigned to the Cloudflare side of the GRE tunnel created as part of the Interconnect.",
			optional: true,
			parse: String,
		},
		"health-check-enabled": {
			kind: "boolean",
			brief: "Determines whether to run healthchecks for a tunnel.",
			optional: true,
		},
		"health-check-rate": {
			kind: "parsed",
			brief:
				"How frequent the health check is run. The default value is `mid`.",
			optional: true,
			choices: ["low", "mid", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-rate", "text"),
		},
		"health-check-target-saved": {
			kind: "parsed",
			brief:
				"The saved health check target. Setting the value to the empty string indicates that the calculated default value will be used.",
			optional: true,
			parse: String,
		},
		"health-check-type": {
			kind: "parsed",
			brief:
				"The type of healthcheck to run, reply or request. The default value is `reply`.",
			optional: true,
			choices: ["reply", "request"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-type", "text"),
		},
		"health-check-direction": {
			kind: "parsed",
			brief:
				"The direction of the flow of the healthcheck. Either unidirectional, where the probe comes to you via the interconnect and the result comes back to Cloudflare via the open Internet, or bidirectional where both the probe and result come and go via the interconnect.",
			optional: true,
			choices: ["unidirectional", "bidirectional"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "health-check-direction", "text"),
		},
		"health-check-source": {
			kind: "parsed",
			brief:
				"The source IPv4 address used for bidirectional health checks. Supported only for version 1.5 interconnects. It is required when `direction` is `bidirectional` and must be omitted (and is cleared) when `direction` is `unidirectional`. The address must be within RFC1918 space, the approved link-local range 169.254.240.0/20, or the Cloudflare reserved range 198.41.199.224/27.",
			optional: true,
			parse: String,
		},
		"interface-address": {
			kind: "parsed",
			brief:
				"The IPv4 interface address for the interconnect. For MPLS Interconnects,\nuse a /30 or /31 prefix. For GRE Interconnects, a /30 or /31 prefix\nmay be used. Version 1.5 interconnects require a /31 prefix and may\nalso use a prefix from the account's authorized prefixes; otherwise,\nselect the subnet from RFC 1918 or the approved link-local ranges.\n",
			optional: true,
			parse: String,
		},
		"interface-address6": {
			kind: "parsed",
			brief:
				"A 127 bit IPV6 prefix from within the virtual_subnet6 prefix space with the address being the first IP of the subnet and not same as the address of virtual_subnet6. Eg if virtual_subnet6 is 2606:54c1:7:0:a9fe:12d2::/127 , interface_address6 could be 2606:54c1:7:0:a9fe:12d2:1:200/127",
			optional: true,
			parse: String,
		},
		mtu: {
			kind: "parsed",
			brief:
				"The Maximum Transmission Unit (MTU) in bytes for the interconnect. The minimum value is 576.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the interconnect. The name cannot share a name with other tunnels.",
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
	operands: [
		{ placeholder: "cf-interconnect-id", brief: "Identifier", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <cf-interconnect-id>",
	describe: "Update interconnect",
	usage:
		"$0 magic-transit cf-interconnects update <cf-interconnect-id>\n\nUpdates a specific interconnect associated with an account. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
