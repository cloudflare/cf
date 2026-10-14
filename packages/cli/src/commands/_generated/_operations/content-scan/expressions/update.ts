/** @generated from content-scan.expressions.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/content-upload-scan/payloads/${request.expression_id}`,
	body: "json",
} as const;
