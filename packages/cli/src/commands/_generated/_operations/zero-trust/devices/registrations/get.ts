/** @generated from zero-trust.devices.registrations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/registrations/${request.registration_id}`,
	query: ["include"],
} as const;
