/** @generated from stream-downloads-create-type-specific-downloads */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/downloads/${request.download_type}`,
} as const;
