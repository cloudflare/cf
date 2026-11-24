import $portals from "./portals/index.js";
import $servers from "./servers/index.js";
/**
 * mcp command
 * @generated from apis/overlays/mcp.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "mcp",
	describe:
		"Manage MCP portals and upstream MCP servers for Cloudflare Access AI controls",

	routes: {
		portals: $portals,
		servers: $servers,
	},
});

export default command;
