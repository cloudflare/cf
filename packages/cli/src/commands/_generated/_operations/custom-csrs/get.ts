/** @generated from custom-csrs.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_csrs/${request.custom_csr_id}`,
} as const;
