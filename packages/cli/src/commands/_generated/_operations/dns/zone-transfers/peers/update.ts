/** @generated from secondary-dns-(-peer)-update-peer */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/peers/${request.peer_id}`,
	body: "json",
} as const;
