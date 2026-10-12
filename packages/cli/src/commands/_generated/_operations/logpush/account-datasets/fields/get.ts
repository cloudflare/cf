/** @generated from logpush.account-datasets.fields.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logpush/datasets/${request.dataset_id}/fields`,
} as const;
