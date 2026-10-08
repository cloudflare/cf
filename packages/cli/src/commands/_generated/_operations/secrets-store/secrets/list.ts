/** @generated from secrets-store.secrets.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/secrets_store/stores/{store_id}/secrets",
	query: ["direction", "page", "per_page", "search", "order", "scopes"],
	joined: ["scopes"],
} as const;
