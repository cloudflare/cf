/** @generated from zero-trust-networks-subnet-update-initial-resolved-ip */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets/initial_resolved_ip/${request.address_family}`,
	body: "json",
} as const;
