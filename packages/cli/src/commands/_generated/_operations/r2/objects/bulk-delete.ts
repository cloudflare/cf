/** @generated from r2.objects.bulk-delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/r2/buckets/{bucket_name}/objects",
	query: ["prefix"],
	headers: ["cf-r2-jurisdiction", "cf-r2-data-catalog-check"],
	body: "json",
} as const;
