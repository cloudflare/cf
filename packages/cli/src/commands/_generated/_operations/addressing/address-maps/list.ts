/** @generated from ip-address-management-address-maps-list-address-maps */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps`,
} as const;
