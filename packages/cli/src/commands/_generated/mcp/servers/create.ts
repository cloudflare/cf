/**
 * create command
 * @generated from apis/overlays/mcp.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"auth-credentials": {
			kind: "parsed",
			brief:
				'Credential configuration for the upstream MCP server. For auth_type "bearer", either a raw token string (e.g. "sk-abc123"), which is wrapped server-side as `Authorization: Bearer <token>`, or a JSON-encoded object of the form `{"headers":{"Header-Name":"value",...}}` for custom or multiple static headers (e.g. Cloudflare Access service tokens: `{"headers":{"cf-access-client-id":"...","cf-access-client-secret":"..."}}`). For auth_type "oauth" with a pre-registered client, send a JSON-encoded object containing `auth_mode:"manual"`, `config.authorization_endpoint`, `config.token_endpoint`, and `registration_info.client_id`. Also provide `registration_info.redirect_uris` unless `is_shared_oauth_callback_enabled` is true. Optional fields include `config.issuer`, `config.revocation_endpoint`, `registration_info.scope`, and `registration_info.token_endpoint_auth_method`. Send the client secret in the separate `client_secret` field. Omit `auth_credentials` on update to preserve the existing configuration.',
			optional: true,
			parse: String,
		},
		"auth-type": {
			kind: "parsed",
			brief:
				"Authentication method used to connect to the upstream MCP server.",
			optional: true,
			choices: ["oauth", "bearer", "unauthenticated"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "auth-type", "text"),
		},
		"client-secret": {
			kind: "parsed",
			brief:
				"Provides 'client_secret' for a pre-registered OAuth client. This field is accepted on create or update only when 'auth_credentials.auth_mode' is 'manual'. It is required when creating an MCP server with manual OAuth credentials or changing an existing server to use manual OAuth credentials. Omit 'client_secret' on update to preserve the existing secret. Provide a new 'client_secret' to rotate the secret. The secret is never returned by read, create, or update requests.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Optional description of the MCP server.",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief: "URL of the upstream MCP endpoint.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief: "Unique identifier for the MCP server.",
			optional: true,
			parse: String,
		},
		"is-shared-oauth-callback-enabled": {
			kind: "boolean",
			brief:
				"When true, per-user authorization uses the shared Cloudflare callback URL as the 'redirect_uri' instead of the portal callback URL. The default is false. Set 'is_shared_oauth_callback_enabled' to true to enable the shared Cloudflare callback URL for this MCP server.",
			default: false,
		},
		name: {
			kind: "parsed",
			brief: "Display name for the MCP server.",
			optional: true,
			parse: String,
		},
		"secure-web-gateway": {
			kind: "boolean",
			brief:
				"Route outbound traffic to this MCP server through Zero Trust Secure Web Gateway.",
			default: false,
		},
		"updated-prompts": {
			kind: "parsed",
			brief:
				'Server-wide prompt capability overrides. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "alias"?: string, "description"?: string, "enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"updated-tools": {
			kind: "parsed",
			brief:
				'Server-wide tool capability overrides. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "alias"?: string, "description"?: string, "enabled"?: boolean}]. ? marks optional keys.',
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
	describe: "Create a new MCP Server",
	usage:
		"$0 mcp servers create\n\nCreates a new MCP server for connecting to an upstream MCP endpoint.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
