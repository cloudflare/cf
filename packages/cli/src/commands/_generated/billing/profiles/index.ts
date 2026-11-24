import $createpaymentintent from "./create-payment-intent.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $updateemail from "./update-email.js";
import $update from "./update.js";
/**
 * profiles command group
 * @generated from apis/overlays/billing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "profiles",
	describe:
		"Billing profile with payment method, address, and invoice preferences",

	routes: {
		create: $create,
		"create-payment-intent": $createpaymentintent,
		delete: $delete,
		get: $get,
		update: $update,
		"update-email": $updateemail,
	},
});

export default command;
