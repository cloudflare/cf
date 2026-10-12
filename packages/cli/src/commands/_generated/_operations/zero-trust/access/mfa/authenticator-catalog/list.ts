/** @generated from access-authenticator-device-aaguids-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/authenticator_device_aaguids`,
} as const;
