/** @generated from sandbox-registrar-extension-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/registrar-sandbox/extensions/${request.extension}`,
} as const;
