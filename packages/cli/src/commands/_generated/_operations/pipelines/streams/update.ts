/** @generated from pipelines.streams.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/streams/${request.stream_id}`,
	body: "json",
} as const;
