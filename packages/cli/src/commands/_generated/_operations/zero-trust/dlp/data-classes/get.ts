/** @generated from zero-trust.dlp.data-classes.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_classes/${request.data_class_id}`,
} as const;
