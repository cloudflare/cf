/** @generated from email-security.investigate.detections.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/${request.investigate_id}/detections`,
} as const;
