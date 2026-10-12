/** @generated from access-jit-request-logs-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/logs/jit_requests/${request.knock_request_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
