import $getdomainsettings from "./get-domain-settings.js";
import $getheartbeat from "./get-heartbeat.js";
import $getproviderconfiguration from "./get-provider-configuration.js";
import $getprovidertemplate from "./get-provider-template.js";
import $postverify from "./post-verify.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * domainconnect command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "domainconnect",
	describe: "Operations for domainconnect",

	builder: (yargs) => {
		return yargs
			.command($getdomainsettings)
			.command($getheartbeat)
			.command($getproviderconfiguration)
			.command($getprovidertemplate)
			.command($postverify)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
