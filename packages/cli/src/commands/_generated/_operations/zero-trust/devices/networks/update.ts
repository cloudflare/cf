/** @generated from zero-trust.devices.networks.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/networks/${request.network_id}`,
	body: "json",
} as const;
