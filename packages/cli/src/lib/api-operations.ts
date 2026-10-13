/**
 * The API operations cf's hand-written commands call that no generated
 * command does, described for `Client.send` the way the generated ones are
 * in `#operations/*`, which hand-written commands import the rest from.
 */
import { type Operation, path } from "#api";

/**
 * Lists Cloudflare Tunnels. The spec's GET of this path is not in the cf-cli
 * audience, so no command is generated for it.
 */
export const listTunnels: Operation = {
	method: "GET",
	path: (request) => path`/accounts/${request.account_id}/cfd_tunnel`,
	query: [
		"name",
		"is_deleted",
		"existed_at",
		"uuid",
		"was_active_at",
		"was_inactive_at",
		"include_prefix",
		"exclude_prefix",
		"status",
		"per_page",
		"page",
	],
};
