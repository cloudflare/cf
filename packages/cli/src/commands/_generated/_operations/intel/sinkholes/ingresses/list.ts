/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/intel/sinkholes/{sinkhole_id}/ingresses */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/intel/sinkholes/${request.sinkhole_id}/ingresses`,
} as const;
