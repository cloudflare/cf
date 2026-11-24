/**
 * read command
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
	command: "read <id>",
	describe: "Read the details of an MCP Server",
	usage:
		"$0 mcp servers read <id>\n\nRetrieves an MCP server's configuration and capability sync state.",
	...parameters,
	loader: () => import("./read.handler.js"),
});

export default command;
