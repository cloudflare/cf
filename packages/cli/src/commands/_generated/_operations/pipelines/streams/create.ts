/** @generated from pipelines.streams.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/streams`,
	body: "json",
} as const;
