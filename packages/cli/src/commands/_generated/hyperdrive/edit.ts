/**
 * edit command
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
				"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API. An empty value leaves the name unchanged.",
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <hyperdrive-id>",
	describe: "Update Hyperdrive",
	usage:
		"$0 hyperdrive edit <hyperdrive-id>\n\nUpdates and returns the specified fields of the Hyperdrive configuration. Custom caching settings are not kept if caching is disabled. For an integration-backed configuration, the integration association is preserved but cannot be changed; omit the integration field.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
