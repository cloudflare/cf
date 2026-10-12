/** @generated from magic-pcap-collection-delete-buckets-for-full-packet-captures */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/ownership/${request.ownership_id}`,
	response: false,
} as const;
