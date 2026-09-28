import $connections from "./connections/index.js";
import $cookies from "./cookies/index.js";
import $policies from "./policies/index.js";
import $scripts from "./scripts/index.js";
import $settings from "./settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * client-side-security command
 * @generated from apis/overlays/client-side-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "client-side-security",
	describe:
		"Client-Side Security — monitor JavaScript, connections, and cookies on your pages for supply-chain attacks",

	builder: (yargs) => {
		return yargs
			.command($connections)
			.command($cookies)
			.command($policies)
			.command($scripts)
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
