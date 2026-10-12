/** @generated from magic-pcap-collection-list-pca-ps-bucket-ownership */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/ownership`,
} as const;
