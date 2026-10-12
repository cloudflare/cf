import $createpaymentintent from "./create-payment-intent.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $updateemail from "./update-email.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * profiles command group
 * @generated from apis/overlays/billing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "profiles",
	describe:
		"Billing profile with payment method, address, and invoice preferences",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($createpaymentintent)
			.command($delete)
			.command($get)
			.command($update)
			.command($updateemail)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
