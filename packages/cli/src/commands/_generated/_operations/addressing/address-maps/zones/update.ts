/** @generated from ip-address-management-address-maps-add-a-zone-membership-to-an-address-map */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps/${request.address_map_id}/zones/${request.member_zone_id}`,
} as const;
