import $analyze from "./analyze/index.js";
import $autoorigintlskex from "./auto-origin-tls-kex/index.js";
import $automaticupgrader from "./automatic-upgrader/index.js";
import $certificatepacks from "./certificate-packs/index.js";
import $recommendations from "./recommendations/index.js";
import $universal from "./universal/index.js";
import $verification from "./verification/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ssl command
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ssl",
	describe:
		"SSL/TLS certificate management — certificate packs, Universal SSL, verification, and TLS mode recommendations",

	builder: (yargs) => {
		return yargs
			.command($analyze)
			.command($autoorigintlskex)
			.command($automaticupgrader)
			.command($certificatepacks)
			.command($recommendations)
			.command($universal)
			.command($verification)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
