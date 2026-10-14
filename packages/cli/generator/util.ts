/**
 * Combined account/zone routing is meaningful only when the two placeholders
 * are adjacent path segments. Similar-looking standalone parameter names are
 * ordinary API inputs and must not acquire global scope behaviour.
 */
export function hasAccountOrZoneScope(path: string): boolean {
	return /(?:^|\/)\{account_or_zone\}\/\{account_or_zone_id\}(?:\/|$)/.test(
		path
	);
}
