/** @generated from zero-trust-networks-subnet-delete-warp */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets/warp/${request.subnet_id}`,
} as const;
