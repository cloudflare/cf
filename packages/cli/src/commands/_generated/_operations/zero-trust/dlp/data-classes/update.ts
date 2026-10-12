/** @generated from zero-trust.dlp.data-classes.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_classes/${request.data_class_id}`,
	body: "json",
} as const;
