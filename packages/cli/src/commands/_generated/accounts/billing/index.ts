import $createSetupIntent from "./createSetupIntent.js";
import $getBadDebt from "./getBadDebt.js";
import $getCredits from "./getCredits.js";
import $getReceiptPdf from "./getReceiptPdf.js";
import $getUnpaidInvoices from "./getUnpaidInvoices.js";
import $history from "./history/index.js";
import $payBadDebt from "./payBadDebt.js";
import $payInvoice from "./payInvoice.js";
import $paymentmethods from "./payment-methods/index.js";
import $togglePdfInvoices from "./togglePdfInvoices.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * billing command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "billing",
	describe: "Operations for billing",

	builder: (yargs) => {
		return yargs
			.command($createSetupIntent)
			.command($getBadDebt)
			.command($getCredits)
			.command($getReceiptPdf)
			.command($getUnpaidInvoices)
			.command($payBadDebt)
			.command($payInvoice)
			.command($togglePdfInvoices)
			.command($history)
			.command($paymentmethods)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
