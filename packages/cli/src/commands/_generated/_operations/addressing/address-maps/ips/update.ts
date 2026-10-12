/** @generated from ip-address-management-address-maps-add-an-ip-to-an-address-map */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps/${request.address_map_id}/ips/${request.ip_address}`,
} as const;
