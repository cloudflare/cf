import $listoperators from "./list-operators.js";
import $optoutoperatorprice from "./opt-out-operator-price.js";
import $setoperatorprice from "./set-operator-price.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pricing command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pricing",
	describe: "Operations for pricing",

	builder: (yargs) => {
		return yargs
			.command($listoperators)
			.command($optoutoperatorprice)
			.command($setoperatorprice)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
