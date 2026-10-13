/** @generated from zero-trust.devices.registrations.override-codes.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/registrations/${request.registration_id}/override_codes`,
} as const;
