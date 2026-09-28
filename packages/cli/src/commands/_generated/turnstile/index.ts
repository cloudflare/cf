import $widgets from "./widgets/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * turnstile command
 * @generated from apis/overlays/turnstile.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "turnstile",
	describe:
		"CAPTCHA-free bot verification widgets that protect forms and APIs without degrading user experience",

	builder: (yargs) => {
		return yargs
			.command($widgets)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
