/** @generated from zero-trust.devices.networks.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/networks/${request.network_id}`,
} as const;
