/** @generated from zero-trust-networks-subnet-update-warp */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets/warp/${request.subnet_id}`,
	body: "json",
} as const;
