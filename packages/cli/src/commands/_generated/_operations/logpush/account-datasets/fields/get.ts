/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/logpush/datasets/{dataset_id}/fields */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logpush/datasets/${request.dataset_id}/fields`,
} as const;
