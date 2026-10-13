/** @generated from addressing.address-maps.zones.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps/${request.address_map_id}/zones/${request.member_zone_id}`,
} as const;
