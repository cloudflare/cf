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
			brief: "Unique identifier for the MCP portal.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "read <id>",
	describe: "Read details of an MCP Portal",
	usage:
		"$0 mcp portals read <id>\n\nRead the details of a single MCP Portal, including its configured servers.",
	...parameters,
	loader: () => import("./read.handler.js"),
});

export default command;
