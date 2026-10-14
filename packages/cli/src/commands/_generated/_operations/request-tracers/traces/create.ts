/** @generated from request-tracers.traces.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/request-tracer/trace`,
	body: "json",
} as const;
