import $list from "./list.js";
import $tests from "./tests/index.js";
import $trend from "./trend.js";
/**
 * pages command group
 * @generated from apis/overlays/speed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "pages",
	describe:
		"Tested pages with their performance history, trends, and individual test results",

	routes: {
		list: $list,
		trend: $trend,
		tests: $tests,
	},
});

export default command;
