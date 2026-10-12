/** @generated from spectrum.apps.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/apps`,
	body: "json",
} as const;
