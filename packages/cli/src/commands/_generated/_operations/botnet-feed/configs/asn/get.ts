/** @generated from botnet-threat-feed-list-asn */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/botnet_feed/configs/asn`,
} as const;
