/** @generated from zero-trust.cws.rego-modules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-modules/${request.rego_module_id}`,
} as const;
