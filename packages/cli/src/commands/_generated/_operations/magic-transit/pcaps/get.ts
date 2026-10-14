/** @generated from magic-transit.pcaps.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/${request.pcap_id}`,
} as const;
