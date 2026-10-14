/** @generated from addressing.address-maps.accounts.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/address_maps/${request.address_map_id}/accounts/${request.member_account_id}`,
} as const;
