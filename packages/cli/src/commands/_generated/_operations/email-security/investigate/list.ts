/** @generated from email_security_investigate */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate`,
	query: [
		"start",
		"end",
		"query",
		"detections_only",
		"final_disposition",
		"metric",
		"message_action",
		"recipient",
		"sender",
		"smtp_helo_ip",
		"alert_id",
		"domain",
		"message_id",
		"subject",
		"delivery_status",
		"cursor",
		"per_page",
		"page",
	],
} as const;
