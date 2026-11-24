/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"client-secret-version": {
			kind: "parsed",
			brief:
				"A version number identifying the current `client_secret` associated with the service token. Incrementing it triggers a rotation; the previous secret will still be accepted until the time indicated by `previous_client_secret_expires_at`. If the service token was reported as leaked, `previous_client_secret_expires_at` is not required, may not be in the future, and the previous secret is discarded immediately.",
			default: "1",
			parse: Number,
		},
		duration: {
			kind: "parsed",
			brief:
				"The duration for how long the service token will be valid. Must be in the format `300ms` or `2h45m`, or the special value `forever` for non-expiring tokens. Valid time units are: ns, us (or µs), ms, s, m, h. The default is 1 year in hours (8760h).",
			default: "8760h",
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether the service token is enabled. A disabled service token cannot be used to authenticate; both its current and previous `client_secret` stop being accepted, but the token itself is preserved and can be re-enabled. A service token reported as leaked is disabled automatically and cannot be re-enabled until its secret is rotated; attempting to do so returns a 409. Defaults to enabled when omitted on create.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The name of the service token.",
			optional: true,
			parse: String,
		},
		"previous-client-secret-expires-at": {
			kind: "parsed",
			brief:
				"The expiration of the previous `client_secret`. This can be modified at any point after a rotation. For example, you may extend it further into the future if you need more time to update services with the new secret; or move it into the past to immediately invalidate the previous token in case of compromise. Rotating a service token that was reported as leaked discards the previous secret entirely, so no grace period can be set.",
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Tags associated with the service token, as key-value pairs. On update, replaces all existing tags. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
	describe: "Create a service token",
	usage:
		"$0 zero-trust access service-tokens create\n\nGenerates a new service token. **Note:** This is the only time you can get the Client Secret. If you lose the Client Secret, you will have to rotate the Client Secret or create a new service token.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
