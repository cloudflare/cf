/** @generated from spectrum-applications-list-spectrum-application-protocols */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/protocols`,
} as const;
