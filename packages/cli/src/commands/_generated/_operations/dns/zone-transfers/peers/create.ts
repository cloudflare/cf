/** @generated from secondary-dns-(-peer)-create-peer */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/peers`,
	body: "json",
} as const;
