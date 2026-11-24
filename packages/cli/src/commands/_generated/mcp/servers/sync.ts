/**
 * sync command
 * @generated from apis/overlays/mcp.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
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
	command: "sync <id>",
	describe: "Sync MCP Server Capabilities",
	usage:
		"$0 mcp servers sync <id>\n\nSyncs an MCP server's capabilities and returns the updated server state, including any connection errors.",
	...parameters,
	loader: () => import("./sync.handler.js"),
});

export default command;
