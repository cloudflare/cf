/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief: "ssl-recommender enrollment setting.",
			optional: true,
		},
		"value-enabled": {
			kind: "boolean",
			brief:
				"Variant descriptions:\n- Whether the feature is enabled or not.\n- Indicates whether or not Automatic Platform Optimization is enabled.",
			optional: true,
		},
		"value-pool-id": {
			kind: "parsed",
			brief:
				"Egress pool id which refers to a grouping of dedicated egress IPs through which Cloudflare will connect to origin.",
			optional: true,
			parse: String,
		},
		"value-cache-by-device-type": {
			kind: "boolean",
			brief:
				"Indicates whether or not [cache by device type](https://developers.cloudflare.com/automatic-platform-optimization/reference/cache-device-type/) is enabled.",
			optional: true,
		},
		"value-cf": {
			kind: "boolean",
			brief: "Indicates whether or not Cloudflare proxy is enabled.",
			optional: true,
		},
		"value-hostnames": {
			kind: "parsed",
			brief:
				"An array of hostnames where Automatic Platform Optimization for WordPress is activated.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-wordpress": {
			kind: "boolean",
			brief: "Indicates whether or not site is powered by WordPress.",
			optional: true,
		},
		"value-wp-plugin": {
			kind: "boolean",
			brief:
				"Indicates whether or not [Cloudflare for WordPress plugin](https://wordpress.org/plugins/cloudflare/) is installed.",
			optional: true,
		},
		"value-strict-transport-security-enabled": {
			kind: "boolean",
			brief: "Whether or not strict transport security is enabled.",
			optional: true,
		},
		"value-strict-transport-security-include-subdomains": {
			kind: "boolean",
			brief: "Include all subdomains for strict transport security.",
			optional: true,
		},
		"value-strict-transport-security-max-age": {
			kind: "parsed",
			brief: "Max age in seconds of the strict transport security.",
			optional: true,
			parse: Number,
		},
		"value-strict-transport-security-nosniff": {
			kind: "boolean",
			brief:
				"Whether or not to include 'X-Content-Type-Options: nosniff' header.",
			optional: true,
		},
		"value-strict-transport-security-preload": {
			kind: "boolean",
			brief: "Enable automatic preload of the HSTS configuration.",
			optional: true,
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
		{ placeholder: "setting-id", brief: "Setting name", parse: String },
	],
	rules(rules) {
		rules.conflicts("value-enabled", [
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.conflicts("value-pool-id", [
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.conflicts("value-cache-by-device-type", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-cache-by-device-type", [
			"value-enabled",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-cf", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-cf", [
			"value-enabled",
			"value-cache-by-device-type",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-hostnames", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-hostnames", [
			"value-enabled",
			"value-cache-by-device-type",
			"value-cf",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-wordpress", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-wordpress", [
			"value-enabled",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wp-plugin",
		]);
		rules.conflicts("value-wp-plugin", [
			"value-pool-id",
			"value-strict-transport-security-enabled",
			"value-strict-transport-security-include-subdomains",
			"value-strict-transport-security-max-age",
			"value-strict-transport-security-nosniff",
			"value-strict-transport-security-preload",
		]);
		rules.implies("value-wp-plugin", [
			"value-enabled",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
		]);
		rules.conflicts("value-strict-transport-security-enabled", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-strict-transport-security-include-subdomains", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-strict-transport-security-max-age", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-strict-transport-security-nosniff", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
		rules.conflicts("value-strict-transport-security-preload", [
			"value-enabled",
			"value-pool-id",
			"value-cache-by-device-type",
			"value-cf",
			"value-hostnames",
			"value-wordpress",
			"value-wp-plugin",
		]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <setting-id>",
	describe: "Edit zone setting",
	usage:
		"$0 zones settings edit <setting-id>\n\nUpdates a single zone setting by the identifier",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
