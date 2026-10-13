/** @generated from images.flows.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/images/v1/flows`,
	body: "json",
} as const;
