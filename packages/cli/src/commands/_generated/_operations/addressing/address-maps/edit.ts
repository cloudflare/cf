/** @generated from ip-address-management-address-maps-update-address-map */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps/${request.address_map_id}`,
	body: "json",
} as const;
