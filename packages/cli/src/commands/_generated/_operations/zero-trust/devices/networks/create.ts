/** @generated from zero-trust.devices.networks.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/networks`,
	body: "json",
	constants: {
		type: "tls",
	},
} as const;
