/** @generated from zero-trust.gateway.egress-cidr-pairs.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/egress_cidr_pairs`,
} as const;
