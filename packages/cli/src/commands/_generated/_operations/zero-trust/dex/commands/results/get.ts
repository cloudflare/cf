/** @generated from get-commands-command-id-downloads-filename */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/commands/${request.command_id}/downloads/${request.filename}`,
	response: "binary-response",
} as const;
