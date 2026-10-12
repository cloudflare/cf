/** @generated from asn-intelligence-get-asn-overview */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/asn/${request.asn}`,
} as const;
