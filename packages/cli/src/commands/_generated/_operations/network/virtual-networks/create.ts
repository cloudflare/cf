/** @generated from tunnel-virtual-network-create-a-virtual-network */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/virtual_networks`,
	body: "json",
} as const;
