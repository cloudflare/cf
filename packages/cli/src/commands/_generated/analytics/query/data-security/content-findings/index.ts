import $topn from "./top-n.js";
/**
 * content-findings command group
 * @generated from apis/overlays/analytics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "content-findings",
	describe: "Operations for query.data-security.content-findings",

	routes: {
		"top-n": $topn,
	},
});

export default command;
