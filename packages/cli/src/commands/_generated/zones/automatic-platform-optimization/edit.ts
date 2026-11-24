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
		"value-cache-by-device-type": {
			kind: "boolean",
			brief: "Whether to cache by device type.",
			optional: true,
		},
		"value-cf": {
			kind: "boolean",
			brief: "Whether the zone is proxied through Cloudflare.",
			optional: true,
		},
		"value-enabled": {
			kind: "boolean",
			brief: "Whether APO is enabled.",
			optional: true,
		},
		"value-hostnames": {
			kind: "parsed",
			brief: "List of hostnames where APO is active.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-recheck": {
			kind: "boolean",
			brief:
				"Whether to recheck WordPress and plugin detection. When an APO configuration already exists, an omitted `recheck` is false, not its stored value.",
			optional: true,
		},
		"value-wordpress": {
			kind: "boolean",
			brief: "Whether the site is a WordPress site.",
			optional: true,
		},
		"value-wp-plugin": {
			kind: "boolean",
			brief: "Whether the Cloudflare WordPress plugin is installed.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Change Automatic Platform Optimization setting",
	usage:
		'$0 zones automatic-platform-optimization edit\n\nAutomatic Platform Optimization (APO) for WordPress is a performance feature that serves your WordPress site from Cloudflare\'s edge network, reducing load times for visitors. Refer to the APO documentation for more information. When an APO configuration already exists, fields omitted from an object `value` keep their current value, except `recheck`, which is false unless the request sends it. Setting `value` to `"off"` disables APO but keeps the detected zone/site/plugin facts. On the first write for a zone (no existing configuration) an object `value` must include `enabled`, `cf`, `wordpress` and `wp_plugin`; otherwise the request fails with error 1023. `"off"` is a no-op when no configuration exists.',
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
