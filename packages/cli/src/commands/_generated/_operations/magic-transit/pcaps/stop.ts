/** @generated from magic-pcap-collection-stop-full-pcap */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/${request.pcap_id}/stop`,
	response: false,
} as const;
