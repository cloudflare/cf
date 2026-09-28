import $schemavalidation from "./schema-validation/index.js";
import $sessionidentifiers from "./session-identifiers/index.js";
import $tokenvalidation from "./token-validation/index.js";
import $vulnerabilityscanner from "./vulnerability-scanner/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * api-security command
 * @generated from apis/overlays/api-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "api-security",
	describe: "api-security",

	builder: (yargs) => {
		return yargs
			.command($schemavalidation)
			.command($sessionidentifiers)
			.command($tokenvalidation)
			.command($vulnerabilityscanner)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
