/** @generated from magic-pcap-collection-download-simple-pcap */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/${request.pcap_id}/download`,
	response: false,
} as const;
