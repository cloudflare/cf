/**
 * update command
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
		"allow-code-mode": {
			kind: "boolean",
			brief:
				"Deprecated: use `code_mode` for new integrations. `true` maps to any non-off Code Mode policy; `false` maps to `code_mode: off`. If both fields are sent, they must be consistent or the request returns a 400.",
			optional: true,
		},
		"code-mode": {
			kind: "parsed",
			brief:
				"Code Mode policy for this portal. `off`: Code Mode is unavailable; query parameters are ignored. `opt_in`: Code Mode is off by default; clients turn it on with `?codemode=search_and_execute`. `default_on`: Code Mode is on by default; clients can opt out with `?codemode=off`. `enforced`: Code Mode is always on; query parameters are ignored. Defaults to `opt_in` when omitted on create. If both `code_mode` and `allow_code_mode` are sent, they must be consistent or the request returns a 400.",
			optional: true,
			choices: ["off", "opt_in", "default_on", "enforced"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "code-mode", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Optional description of the MCP portal.",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief: "Hostname where the MCP portal is available.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Display name for the MCP portal.",
			optional: true,
			parse: String,
		},
		"secure-web-gateway": {
			kind: "boolean",
			brief:
				"Route outbound MCP traffic through Zero Trust Secure Web Gateway.",
			optional: true,
		},
		servers: {
			kind: "parsed",
			brief:
				'MCP servers attached to the portal and their portal-specific settings. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"server_id": string, "default_disabled"?: boolean, "on_behalf"?: boolean, "updated_prompts"?: [{...}], "updated_tools"?: [{...}]}]. ? marks optional keys.',
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
			brief: "Unique identifier for the MCP portal.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <id>",
	describe: "Update an MCP Portal",
	usage: "$0 mcp portals update <id>\n\nUpdates an MCP portal configuration.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
