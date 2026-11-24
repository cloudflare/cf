/**
 * replace command
 * @generated from apis/overlays/hyperdrive.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"caching-disabled": {
			kind: "boolean",
			brief:
				"Set to true to disable caching of SQL responses. Default is false.",
			optional: true,
		},
		"caching-max-age": {
			kind: "parsed",
			brief:
				"Specify the maximum duration (in seconds) items should persist in the cache. Defaults to 60 seconds if not specified.",
			optional: true,
			parse: Number,
		},
		"caching-stale-while-revalidate": {
			kind: "parsed",
			brief:
				"Specify the number of seconds the cache may serve a stale response. Defaults to 15 seconds if not specified.",
			optional: true,
			parse: Number,
		},
		"mtls-ca-certificate-id": {
			kind: "parsed",
			brief: "Define CA certificate ID obtained after uploading CA cert.",
			optional: true,
			parse: String,
		},
		"mtls-certificate-id": {
			kind: "parsed",
			brief: "Define mTLS certificate ID obtained after uploading client cert.",
			optional: true,
			parse: String,
		},
		"mtls-sslmode": {
			kind: "parsed",
			brief:
				"PostgreSQL accepts `require`, `verify-ca`, and `verify-full`. MySQL accepts `REQUIRED`, `VERIFY_CA`, and `VERIFY_IDENTITY`. The verify modes require a CA certificate; the require modes cannot be used with a CA certificate.",
			optional: true,
			choices: [
				"require",
				"verify-ca",
				"verify-full",
				"REQUIRED",
				"VERIFY_CA",
				"VERIFY_IDENTITY",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "mtls-sslmode", "text"),
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API.",
			optional: true,
			parse: String,
		},
		"origin-database": {
			kind: "parsed",
			brief: "Set the name of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-password": {
			kind: "parsed",
			brief:
				"Set the password needed to access your origin database. The API never returns this write-only value.",
			optional: true,
			parse: String,
		},
		"origin-scheme": {
			kind: "parsed",
			brief:
				"Specifies the URL scheme used to connect to your origin database.",
			optional: true,
			choices: ["postgres", "postgresql", "mysql"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "origin-scheme", "text"),
		},
		"origin-user": {
			kind: "parsed",
			brief: "Set the user of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-host": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- Defines the publicly reachable hostname or IP of your origin database. Private, loopback, and link-local IP addresses are not allowed.\n- Defines the host (hostname or IP) of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-port": {
			kind: "parsed",
			brief:
				"Defines the port of your origin database. Defaults to 5432 for PostgreSQL or 3306 for MySQL if not specified.",
			optional: true,
			parse: Number,
		},
		"origin-access-client-id": {
			kind: "parsed",
			brief:
				"Defines the Client ID of the Access token to use when connecting to the origin database.",
			optional: true,
			parse: String,
		},
		"origin-access-client-secret": {
			kind: "parsed",
			brief:
				"Defines the Client Secret of the Access Token to use when connecting to the origin database. The API never returns this write-only value.",
			optional: true,
			parse: String,
		},
		"origin-service-id": {
			kind: "parsed",
			brief:
				"The identifier of the Workers VPC Service to connect through. Hyperdrive will egress through the specified VPC Service to reach the origin database.",
			optional: true,
			parse: String,
		},
		"origin-connection-limit": {
			kind: "parsed",
			brief:
				"The (soft) maximum number of connections the Hyperdrive is allowed to make to the origin database.\n\nMaximum allowed: 20 for free tier accounts, 100 for paid tier accounts.\nIf not specified, defaults to 20 for free tier and 60 for paid tier.\nCertain Cloudflare-managed origins may be permitted a higher limit.\nContact Cloudflare if you need a higher limit.\n",
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
	operands: [
		{
			placeholder: "hyperdrive-id",
			brief: "The unique identifier of the Hyperdrive configuration.",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("origin-host", ["origin-service-id"]);
		rules.conflicts("origin-port", [
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("origin-port", ["origin-host"]);
		rules.conflicts("origin-access-client-id", [
			"origin-port",
			"origin-service-id",
		]);
		rules.implies("origin-access-client-id", [
			"origin-host",
			"origin-access-client-secret",
		]);
		rules.conflicts("origin-access-client-secret", [
			"origin-port",
			"origin-service-id",
		]);
		rules.implies("origin-access-client-secret", [
			"origin-host",
			"origin-access-client-id",
		]);
		rules.conflicts("origin-service-id", [
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
		]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "replace <hyperdrive-id>",
	describe: "Replace Hyperdrive",
	usage:
		"$0 hyperdrive replace <hyperdrive-id>\n\nReplaces and returns the specified Hyperdrive configuration. The request must include the name and complete origin connection details. Omitted caching settings are reset to their defaults, while omitted mTLS settings and origin connection limits are preserved. The integration association is set only during creation and cannot be changed; omit the integration field even when replacing an integration-backed configuration. Use the update operation to modify only selected fields.",
	...parameters,
	loader: () => import("./replace.handler.js"),
});

export default command;
