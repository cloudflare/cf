import $configs from "./configs/index.js";
import $rules from "./rules/index.js";
import $vpcflows from "./vpc-flows/index.js";
/**
 * magic-network-monitoring command
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "magic-network-monitoring",
	describe:
		"Flow-based network traffic monitoring with configurable alerting rules and VPC flow ingestion",

	routes: {
		configs: $configs,
		rules: $rules,
		"vpc-flows": $vpcflows,
	},
});

export default command;
