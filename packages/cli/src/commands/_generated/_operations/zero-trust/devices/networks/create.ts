/** @generated from device-managed-networks-create-device-managed-network */
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
