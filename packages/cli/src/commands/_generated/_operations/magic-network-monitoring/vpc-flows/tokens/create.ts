/** @generated from magic-network-monitoring.vpc-flows.tokens.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/vpc-flows/token`,
} as const;
