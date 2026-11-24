import $listoperators from "./list-operators.js";
import $optoutoperatorprice from "./opt-out-operator-price.js";
import $setoperatorprice from "./set-operator-price.js";
/**
 * pricing command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "pricing",
	describe: "Operations for pricing",

	routes: {
		"list-operators": $listoperators,
		"opt-out-operator-price": $optoutoperatorprice,
		"set-operator-price": $setoperatorprice,
	},
});

export default command;
