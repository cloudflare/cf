import $botclass from "./bot-class/index.js";
import $browserfamily from "./browser-family/index.js";
import $devicetype from "./device-type/index.js";
import $get from "./get.js";
import $httpmethod from "./http-method/index.js";
import $httpprotocol from "./http-protocol/index.js";
import $ipversion from "./ip-version/index.js";
import $os from "./os/index.js";
import $tlsversion from "./tls-version/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ases command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ases",
	describe: "Operations for http.ases",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($botclass)
			.command($browserfamily)
			.command($devicetype)
			.command($httpmethod)
			.command($httpprotocol)
			.command($ipversion)
			.command($os)
			.command($tlsversion)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
