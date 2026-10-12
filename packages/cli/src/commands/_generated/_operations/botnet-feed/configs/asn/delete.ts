/** @generated from botnet-threat-feed-delete-asn */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/botnet_feed/configs/asn/${request.asn_id}`,
} as const;
