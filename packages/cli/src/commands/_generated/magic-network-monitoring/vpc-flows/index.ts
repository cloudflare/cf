import $tokens from "./tokens/index.js";
/**
 * vpc-flows command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "vpc-flows",
	describe:
		"Ingest VPC flow logs from cloud providers for network visibility and anomaly detection",

	routes: {
		tokens: $tokens,
	},
});

export default command;
