/** @generated from zero-trust-networks-subnet-get-warp */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets/warp/${request.subnet_id}`,
} as const;
