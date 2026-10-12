/** @generated from zero-trust-networks-subnet-create-warp */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets/warp`,
	body: "json",
} as const;
