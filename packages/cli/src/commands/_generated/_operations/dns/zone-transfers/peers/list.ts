/** @generated from secondary-dns-(-peer)-list-peers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/peers`,
} as const;
