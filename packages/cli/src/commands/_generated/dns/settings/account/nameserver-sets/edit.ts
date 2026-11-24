/**
 * edit command
 * @generated from apis/overlays/dns.ts
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
			brief:
				"Customer-defined name, unique within the account by exact string equality (case-sensitive, with no Unicode normalization). Must be valid UTF-8 and at most 255 UTF-8 bytes, not 255 characters. Only graphical Unicode characters are allowed; leading or trailing whitespace is rejected. The name can be changed without changing the set's nameservers or addresses.",
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
			brief:
				"Updates only the customer-defined name. All other fields are rejected, even if unchanged. An empty object or the current name succeeds without changing the set. A null name is invalid. Requires the account-scoped creation entitlements, including eligibility for the set's current IP set and the Advanced entitlement for an Advanced set.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "nameserver-set-id",
			brief: "Identifier for a nameserver set.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <nameserver-set-id>",
	describe: "Update Custom Nameserver Set",
	usage:
		"$0 dns settings account nameserver-sets edit <nameserver-set-id>\n\nRenames a Custom Nameserver Set owned by the account. Only name may be supplied; immutable and unknown fields are rejected even if unchanged. An empty object or the existing name is a successful no-op. Requires the account-scoped creation entitlements for the existing set.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
