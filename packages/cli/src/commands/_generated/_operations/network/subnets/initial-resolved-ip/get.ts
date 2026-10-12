/** @generated from zero-trust-networks-subnet-get-initial-resolved-ip */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets/initial_resolved_ip/${request.address_family}`,
} as const;
