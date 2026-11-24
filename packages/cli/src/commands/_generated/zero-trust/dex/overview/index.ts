import $tests from "./tests/index.js";
/**
 * overview command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "overview",
	describe: "Operations for dex.overview",

	routes: {
		tests: $tests,
	},
});

export default command;
