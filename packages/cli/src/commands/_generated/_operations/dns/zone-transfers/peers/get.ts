/** @generated from secondary-dns-(-peer)-peer-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/peers/${request.peer_id}`,
} as const;
