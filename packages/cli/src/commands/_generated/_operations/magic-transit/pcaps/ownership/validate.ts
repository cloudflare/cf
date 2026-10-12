/** @generated from magic-pcap-collection-validate-buckets-for-full-packet-captures */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/ownership/validate`,
	body: "json",
} as const;
