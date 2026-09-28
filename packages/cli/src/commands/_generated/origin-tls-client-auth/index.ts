import $hostnameassociations from "./hostname-associations/index.js";
import $hostnamecertificates from "./hostname-certificates/index.js";
import $hostnames from "./hostnames/index.js";
import $settings from "./settings/index.js";
import $zonecertificates from "./zone-certificates/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * origin-tls-client-auth command
 * @generated from apis/overlays/origin-tls-client-auth.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "origin-tls-client-auth",
	describe: "origin-tls-client-auth",

	builder: (yargs) => {
		return yargs
			.command($hostnameassociations)
			.command($hostnamecertificates)
			.command($hostnames)
			.command($settings)
			.command($zonecertificates)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
