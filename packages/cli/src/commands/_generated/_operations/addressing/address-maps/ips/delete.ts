/** @generated from ip-address-management-address-maps-remove-an-ip-from-an-address-map */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps/${request.address_map_id}/ips/${request.ip_address}`,
} as const;
