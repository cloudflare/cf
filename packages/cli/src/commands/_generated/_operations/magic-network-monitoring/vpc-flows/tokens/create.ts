/** @generated from magic-network-monitoring-vpc-flows-generate-authentication-token */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/mnm/vpc-flows/token`,
} as const;
