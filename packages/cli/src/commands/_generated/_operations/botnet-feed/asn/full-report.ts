/** @generated from botnet-feed.asn.full-report */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/botnet_feed/asn/${request.asn_id}/full_report`,
} as const;
