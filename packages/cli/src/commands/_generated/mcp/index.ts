import $portals from "./portals/index.js";
import $servers from "./servers/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * mcp command
 * @generated from apis/overlays/mcp.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "mcp",
	describe:
		"Manage MCP portals and upstream MCP servers for Cloudflare Access AI controls",

	builder: (yargs) => {
		return yargs
			.command($portals)
			.command($servers)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
