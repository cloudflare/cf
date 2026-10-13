/** @generated from addressing.address-maps.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps`,
	body: "json",
} as const;
