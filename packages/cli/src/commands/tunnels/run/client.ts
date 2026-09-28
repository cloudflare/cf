import { isUUID } from "../../../lib/resolve.js";
import type { Cloudflare } from "../../../lib/auth.js";

const TUNNEL_LIST_PAGE_SIZE = 1000;

export async function resolveTunnelId(
	client: Cloudflare,
	accountId: string,
	nameOrId: string
): Promise<string> {
	if (isUUID(nameOrId)) {
		return nameOrId;
	}

	let matchCount = 0;
	let matchId: string | undefined;
	for (let page = 1; ; page++) {
		const response = await client.tunnel.list({
			account_id: accountId,
			name: nameOrId,
			is_deleted: false,
			page,
			per_page: TUNNEL_LIST_PAGE_SIZE,
		});
		const tunnels = response.result ?? [];
		for (const tunnel of tunnels) {
			if (tunnel.name === nameOrId) {
				matchCount++;
				matchId = tunnel.id;
			}
		}

		const perPage = response.result_info?.per_page || TUNNEL_LIST_PAGE_SIZE;
		if (tunnels.length < perPage) {
			break;
		}
	}

	if (matchCount === 0) {
		throw new Error(
			`"${nameOrId}" is neither the ID nor the name of any tunnel. ` +
				"Run `cf tunnels list` to see available tunnels."
		);
	}
	if (matchCount > 1) {
		throw new Error(
			`Found multiple tunnels named "${nameOrId}". Pass the tunnel UUID instead.`
		);
	}

	if (!matchId) {
		throw new Error(
			`Tunnel "${nameOrId}" was found but has no ID. Pass the tunnel UUID instead.`
		);
	}
	return matchId;
}

export async function getTunnelToken(
	client: Cloudflare,
	accountId: string,
	tunnelId: string
): Promise<string> {
	const token = await client.tunnels.token.get({
		account_id: accountId,
		tunnel_id: tunnelId,
	});
	if (typeof token !== "string" || token.length === 0) {
		throw new Error(`The API returned an empty token for tunnel ${tunnelId}.`);
	}
	return token;
}
