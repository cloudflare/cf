/** @generated from stream.keys.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/keys/${request.identifier}`,
} as const;
