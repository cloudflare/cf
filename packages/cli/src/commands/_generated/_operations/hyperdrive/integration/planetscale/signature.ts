/** @generated from create-hyperdrive-database-signature */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/hyperdrive/integrationsOperations/planetScale/createDatabaseSignature`,
} as const;
