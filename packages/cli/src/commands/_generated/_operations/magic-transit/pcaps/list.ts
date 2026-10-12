/** @generated from magic-pcap-collection-list-packet-capture-requests */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps`,
} as const;
