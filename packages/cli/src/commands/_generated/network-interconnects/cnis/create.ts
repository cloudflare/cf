/**
 * create command
 * @generated from apis/overlays/network-interconnects.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		account: {
			kind: "parsed",
			brief: "Customer account tag",
			optional: true,
			parse: String,
		},
		"bgp-customer-asn": {
			kind: "parsed",
			brief: "ASN used on the customer end of the BGP session",
			optional: true,
			parse: Number,
		},
		"bgp-extra-prefixes": {
			kind: "parsed",
			brief:
				"Extra set of static prefixes to advertise to the customer's end of the session\nPrefixes containing host bits will be normalized to contain network bits only.\nDuplicates are not allowed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"bgp-md5-key": {
			kind: "parsed",
			brief:
				"MD5 key to use for session authentication.\n\nNote that *this is not a security measure*. MD5 is not a valid security mechanism, and the\nkey is not treated as a secret value. This is *only* supported for preventing\nmisconfiguration, not for defending against malicious attacks.\n\nThe MD5 key, if set, must be of non-zero length and consist only of the following types of\ncharacter:\n\n* ASCII alphanumerics: `[a-zA-Z0-9]`\n* Special characters in the set `'!@#$%^&*()+[]{}<>/.,;:_-~`= \\|`\n\nIn other words, MD5 keys may contain any printable ASCII character aside from newline\n(0x0A), quotation mark (`\"`), vertical tab (0x0B), carriage return (0x0D), tab (0x09),\nform feed (0x0C), and the question mark (`?`). Requests specifying an MD5 key with one\nor more of these disallowed characters will be rejected.",
			optional: true,
			parse: String,
		},
		interconnect: {
			kind: "parsed",
			brief: "The interconnect field",
			optional: true,
			parse: String,
		},
		"magic-conduit-name": {
			kind: "parsed",
			brief: "The magic.conduit_name field",
			optional: true,
			parse: String,
		},
		"magic-description": {
			kind: "parsed",
			brief: "The magic.description field",
			optional: true,
			parse: String,
		},
		"magic-mtu": {
			kind: "parsed",
			brief: "The magic.mtu field",
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"bgp-customer-asn",
				"bgp-extra-prefixes",
				"bgp-md5-key",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["bgp-customer-asn", "bgp-extra-prefixes"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --bgp-* flag is set`
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
	describe: "Create a new CNI object",
	usage:
		"$0 network-interconnects cnis create\n\nCreates a new Cloud Network Interconnect (CNI) for private network connectivity between Cloudflare and your infrastructure. CNIs enable dedicated, high-performance network links.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
