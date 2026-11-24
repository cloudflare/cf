/**
 * update command
 * @generated from apis/overlays/mcp.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"auth-credentials": {
			kind: "parsed",
			brief:
				'Credential configuration for the upstream MCP server. For auth_type "bearer", either a raw token string (e.g. "sk-abc123"), which is wrapped server-side as `Authorization: Bearer <token>`, or a JSON-encoded object of the form `{"headers":{"Header-Name":"value",...}}` for custom or multiple static headers (e.g. Cloudflare Access service tokens: `{"headers":{"cf-access-client-id":"...","cf-access-client-secret":"..."}}`). For auth_type "oauth" with a pre-registered client, send a JSON-encoded object containing `auth_mode:"manual"`, `config.authorization_endpoint`, `config.token_endpoint`, and `registration_info.client_id`. Also provide `registration_info.redirect_uris` unless `is_shared_oauth_callback_enabled` is true. Optional fields include `config.issuer`, `config.revocation_endpoint`, `registration_info.scope`, and `registration_info.token_endpoint_auth_method`. Send the client secret in the separate `client_secret` field. Omit `auth_credentials` on update to preserve the existing configuration.',
			optional: true,
			parse: String,
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
		"is-shared-oauth-callback-enabled": {
			kind: "boolean",
			brief:
				"When true, per-user authorization uses the shared Cloudflare callback URL as the 'redirect_uri' instead of the portal callback URL. The default is false. Set 'is_shared_oauth_callback_enabled' to true to enable the shared Cloudflare callback URL for this MCP server.",
			optional: true,
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
			optional: true,
		},
		"updated-prompts": {
			kind: "parsed",
			brief:
				'Prompt overrides. Omit to preserve, send [] to clear, or null to reset the field to absence. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"name": string, "alias"?: string, "description"?: string, "enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"updated-tools": {
			kind: "parsed",
			brief:
				'Tool overrides. Omit to preserve, send [] to clear, or null to reset the field to absence. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"name": string, "alias"?: string, "description"?: string, "enabled"?: boolean}]. ? marks optional keys.',
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
	operands: [
		{
			placeholder: "id",
			brief: "Unique identifier for the MCP server.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <id>",
	describe: "Update an MCP Server",
	usage:
		"$0 mcp servers update <id>\n\nUpdates an MCP server's configuration and credentials.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
