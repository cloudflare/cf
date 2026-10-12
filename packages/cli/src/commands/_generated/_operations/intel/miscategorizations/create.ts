/** @generated from miscategorization-create-miscategorization */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/miscategorization`,
	body: "json",
} as const;
