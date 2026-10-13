/** @generated from registrar.registrations.transfer-in */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar/registrations/${request.domain_name}/transfer-in`,
	headers: ["Prefer"],
	body: "json",
} as const;
