/** @generated from dlp-custom-prompt-topics-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/custom_prompt_topics/${request.entry_id}`,
	body: "json",
} as const;
