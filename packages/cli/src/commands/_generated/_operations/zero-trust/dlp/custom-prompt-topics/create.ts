/** @generated from zero-trust.dlp.custom-prompt-topics.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/custom_prompt_topics`,
	body: "json",
} as const;
