import $createsetupintent from "./create-setup-intent.js";
import $getbaddebt from "./get-bad-debt.js";
import $getcredits from "./get-credits.js";
import $getreceiptpdf from "./get-receipt-pdf.js";
import $getunpaidinvoices from "./get-unpaid-invoices.js";
import $history from "./history/index.js";
import $payinvoice from "./pay-invoice.js";
import $paymentmethods from "./payment-methods/index.js";
import $togglepdfinvoices from "./toggle-pdf-invoices.js";
/**
 * billing command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "billing",
	describe: "Operations for billing",

	routes: {
		"create-setup-intent": $createsetupintent,
		"get-bad-debt": $getbaddebt,
		"get-credits": $getcredits,
		"get-receipt-pdf": $getreceiptpdf,
		"get-unpaid-invoices": $getunpaidinvoices,
		"pay-invoice": $payinvoice,
		"toggle-pdf-invoices": $togglepdfinvoices,
		history: $history,
		"payment-methods": $paymentmethods,
	},
});

export default command;
