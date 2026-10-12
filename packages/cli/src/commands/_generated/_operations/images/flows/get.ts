/** @generated from get_FlowsGet */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/images/v1/flows`,
} as const;
