/** @generated from zaraz.workflow.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/workflow`,
	body: "json",
} as const;
