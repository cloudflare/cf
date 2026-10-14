/** @generated from zero-trust.devices.registrations.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/registrations/${request.registration_id}`,
} as const;
