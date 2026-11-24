import $colos from "./colos/index.js";
import $commands from "./commands/index.js";
import $devices from "./devices/index.js";
import $isps from "./isps/index.js";
import $overview from "./overview/index.js";
import $rules from "./rules/index.js";
import $testresults from "./test-results/index.js";
import $tests from "./tests/index.js";
import $warpchangeevents from "./warp-change-events/index.js";
/**
 * dex command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dex",
	describe:
		"Digital Experience Monitoring — synthetic tests, fleet-wide device metrics, and network path diagnostics",

	routes: {
		colos: $colos,
		commands: $commands,
		devices: $devices,
		isps: $isps,
		overview: $overview,
		rules: $rules,
		"test-results": $testresults,
		tests: $tests,
		"warp-change-events": $warpchangeevents,
	},
});

export default command;
