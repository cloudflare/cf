/** @generated from dlp-data-classes-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_classes/${request.data_class_id}`,
} as const;
