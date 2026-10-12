/** @generated from addressing.address-maps.ips.update-bulk */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps/${request.address_map_id}/ips`,
	body: "json",
} as const;
