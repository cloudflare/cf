/**
 * list command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		hostname: {
			kind: "parsed",
			brief:
				"Fully qualified domain name to match against. This parameter cannot be used with the 'id', 'hostname.exact', 'hostname.contain', or 'hostname.startsWith' parameters.",
			optional: true,
			parse: String,
		},
		"hostname-exact": {
			kind: "parsed",
			brief:
				"Fully qualified domain name to match against. This parameter cannot be used with the 'id', 'hostname', 'hostname.contain', or 'hostname.startsWith' parameters.",
			optional: true,
			parse: String,
		},
		"hostname-starts-with": {
			kind: "parsed",
			brief:
				"Filters hostnames by a prefix match on the hostname value. This parameter cannot be used with the 'id', 'hostname', 'hostname.exact', or 'hostname.contain' parameters.",
			optional: true,
			parse: String,
		},
		"hostname-contain": {
			kind: "parsed",
			brief:
				"Filters hostnames by a substring match on the hostname value. This parameter cannot be used with the 'id', 'hostname', 'hostname.exact', or 'hostname.startsWith' parameters.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief:
				"Hostname ID to match against. This ID was generated and returned during the initial custom_hostname creation. This parameter cannot be used with the 'hostname', 'hostname.exact', 'hostname.contain', or 'hostname.startsWith' parameters.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of hostnames per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order hostnames by.",
			values: ["ssl", "ssl_status"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order hostnames.",
			values: ["asc", "desc"],
			optional: true,
		},
		"ssl-status": {
			kind: "enum",
			brief: "Filter by SSL certificate status.",
			values: [
				"initializing",
				"pending_validation",
				"deleted",
				"pending_issuance",
				"pending_deployment",
				"pending_deletion",
				"pending_expiration",
				"expired",
				"active",
				"initializing_timed_out",
				"validation_timed_out",
				"issuance_timed_out",
				"deployment_timed_out",
				"deletion_timed_out",
				"pending_cleanup",
				"staging_deployment",
				"staging_active",
				"deactivating",
				"inactive",
				"backup_issued",
				"holding_deployment",
			],
			optional: true,
		},
		"hostname-status": {
			kind: "enum",
			brief: "Filter by the hostname's activation status.",
			values: [
				"active",
				"pending",
				"active_redeploying",
				"moved",
				"pending_deletion",
				"deleted",
				"pending_blocked",
				"pending_migration",
				"pending_provisioned",
				"test_pending",
				"test_active",
				"test_active_apex",
				"test_blocked",
				"test_failed",
				"provisioned",
				"blocked",
			],
			optional: true,
		},
		"certificate-authority": {
			kind: "enum",
			brief:
				"Filter by the certificate authority that issued the SSL certificate.",
			values: ["google", "lets_encrypt", "ssl_com"],
			optional: true,
		},
		wildcard: {
			kind: "boolean",
			brief: "Filter by whether the custom hostname is a wildcard hostname.",
			optional: true,
		},
		"custom-origin-server": {
			kind: "parsed",
			brief: "Filter by custom origin server name.",
			optional: true,
			parse: String,
		},
		ssl: {
			kind: "enum",
			brief: "Whether to filter hostnames based on if they have SSL enabled.",
			values: ["0", "1"],
			optional: true,
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
	describe: "List Custom Hostnames",
	usage:
		"$0 custom-hostnames list\n\nList, search, sort, and filter all of your custom hostnames.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
