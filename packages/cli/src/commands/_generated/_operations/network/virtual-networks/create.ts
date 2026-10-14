/** @generated from network.virtual-networks.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/virtual_networks`,
	body: "json",
} as const;
