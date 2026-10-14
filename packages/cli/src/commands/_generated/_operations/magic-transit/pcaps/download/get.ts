/** @generated from magic-transit.pcaps.download.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/${request.pcap_id}/download`,
	response: false,
} as const;
