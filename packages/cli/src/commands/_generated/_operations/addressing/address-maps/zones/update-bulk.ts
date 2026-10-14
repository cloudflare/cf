/** @generated from addressing.address-maps.zones.update-bulk */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps/${request.address_map_id}/zones`,
	body: "json",
} as const;
