/** @generated from magic-pcap-collection-add-buckets-for-full-packet-captures */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/ownership`,
	body: "json",
} as const;
