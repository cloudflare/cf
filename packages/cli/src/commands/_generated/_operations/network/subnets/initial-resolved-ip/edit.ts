/** @generated from network.subnets.initial-resolved-ip.edit */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets/initial_resolved_ip/${request.address_family}`,
	body: "json",
} as const;
