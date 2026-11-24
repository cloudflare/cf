/**
 * create command
 * @generated from apis/overlays/iam.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"allowed-cors-origins": {
			kind: "parsed",
			brief: "Array of allowed CORS origins.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"client-name": {
			kind: "parsed",
			brief: "Human-readable name of the OAuth client.",
			optional: true,
			parse: String,
		},
		"client-uri": {
			kind: "parsed",
			brief: "URL of the home page of the client.",
			optional: true,
			parse: String,
		},
		"grant-types": {
			kind: "parsed",
			brief:
				"Array of OAuth grant types the client is allowed to use. `authorization_code` is required; `refresh_token` may be included optionally.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"logo-uri": {
			kind: "parsed",
			brief: "URL of the client's logo.",
			optional: true,
			parse: String,
		},
		"optional-scopes": {
			kind: "parsed",
			brief:
				"Scopes that the authorizing user may decline during consent. Each value must also appear in `scopes`. The scopes `openid`, `offline`, and `offline_access` cannot be optional.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"policy-uri": {
			kind: "parsed",
			brief: "URL that points to a privacy policy document.",
			optional: true,
			parse: String,
		},
		"post-logout-redirect-uris": {
			kind: "parsed",
			brief: "Array of allowed post-logout redirect URIs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"redirect-uris": {
			kind: "parsed",
			brief: "Array of allowed redirect URIs for the client.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"response-types": {
			kind: "parsed",
			brief: "Array of OAuth response types the client is allowed to use.",
			variadic: true,
			optional: true,
			parse: String,
		},
		scopes: {
			kind: "parsed",
			brief:
				"Array of OAuth scopes the client is allowed to request. Colon-delimited scopes are not accepted. Dot-delimited scopes are validated against available OAuth API scopes; simple identity scopes are allowed. Protocol scopes `offline_access` and `openid` are added or removed automatically based on `grant_types` and `response_types`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"token-endpoint-auth-method": {
			kind: "parsed",
			brief: "The authentication method the client uses at the token endpoint.",
			optional: true,
			choices: ["none", "client_secret_basic", "client_secret_post"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "token-endpoint-auth-method", "text"),
		},
		"tos-uri": {
			kind: "parsed",
			brief: "URL that points to a terms of service document.",
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
	describe: "Create OAuth Client",
	usage:
		"$0 iam oauth-clients create\n\nCreate a new OAuth client for an account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
