/** @generated from asn-intelligence-get-asn-subnets */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/asn/${request.asn}/subnets`,
} as const;
