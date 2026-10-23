import $createsetupintent from "./create-setup-intent.js";
import $getbaddebt from "./get-bad-debt.js";
import $getcredits from "./get-credits.js";
import $getreceiptpdf from "./get-receipt-pdf.js";
import $getunpaidinvoices from "./get-unpaid-invoices.js";
import $history from "./history/index.js";
import $payinvoice from "./pay-invoice.js";
import $paymentmethods from "./payment-methods/index.js";
import $togglepdfinvoices from "./toggle-pdf-invoices.js";
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
			.command($createsetupintent)
			.command($getbaddebt)
			.command($getcredits)
			.command($getreceiptpdf)
			.command($getunpaidinvoices)
			.command($payinvoice)
			.command($togglepdfinvoices)
			.command($history)
			.command($paymentmethods)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
