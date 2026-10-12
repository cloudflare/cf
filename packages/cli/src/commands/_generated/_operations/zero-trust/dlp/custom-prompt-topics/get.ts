/** @generated from zero-trust.dlp.custom-prompt-topics.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/custom_prompt_topics/${request.entry_id}`,
} as const;
