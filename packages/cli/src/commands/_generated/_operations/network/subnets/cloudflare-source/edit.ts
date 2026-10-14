/** @generated from network.subnets.cloudflare-source.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets/cloudflare_source/${request.address_family}`,
	body: "json",
} as const;
