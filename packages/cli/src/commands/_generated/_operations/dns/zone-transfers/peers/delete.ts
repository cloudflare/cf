/** @generated from dns.zone-transfers.peers.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/peers/${request.peer_id}`,
} as const;
