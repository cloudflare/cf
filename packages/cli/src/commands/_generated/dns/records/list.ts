/**
 * list command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Exact value of the DNS record name. This is a convenience alias for `name.exact`.",
			optional: true,
			parse: String,
		},
		"name-exact": {
			kind: "parsed",
			brief:
				"Exact value of the DNS record name. Name filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"name-contains": {
			kind: "parsed",
			brief:
				"Substring of the DNS record name. Name filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"name-startswith": {
			kind: "parsed",
			brief:
				"Prefix of the DNS record name. Name filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"name-endswith": {
			kind: "parsed",
			brief:
				"Suffix of the DNS record name. Name filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "enum",
			brief: "Record type.",
			values: [
				"A",
				"AAAA",
				"CAA",
				"CERT",
				"CNAME",
				"DNSKEY",
				"DS",
				"HTTPS",
				"LOC",
				"MX",
				"NAPTR",
				"NS",
				"OPENPGPKEY",
				"PTR",
				"SMIMEA",
				"SRV",
				"SSHFP",
				"SVCB",
				"TLSA",
				"TXT",
				"URI",
			],
			optional: true,
		},
		content: {
			kind: "parsed",
			brief:
				"Exact value of the DNS record content. This is a convenience alias for `content.exact`.",
			optional: true,
			parse: String,
		},
		"content-exact": {
			kind: "parsed",
			brief:
				"Exact value of the DNS record content. Content filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"content-contains": {
			kind: "parsed",
			brief:
				"Substring of the DNS record content. Content filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"content-startswith": {
			kind: "parsed",
			brief:
				"Prefix of the DNS record content. Content filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"content-endswith": {
			kind: "parsed",
			brief:
				"Suffix of the DNS record content. Content filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		proxied: {
			kind: "boolean",
			brief:
				"Whether the record is receiving the performance and security benefits of Cloudflare.",
			optional: true,
		},
		match: {
			kind: "enum",
			brief:
				"Whether to match all search requirements or at least one (any). If set to `all`, acts like a logical AND between filters. If set to `any`, acts like a logical OR instead. Note that the interaction between tag filters is controlled by the `tag-match` parameter instead.",
			values: ["any", "all"],
			optional: true,
		},
		comment: {
			kind: "parsed",
			brief:
				"Exact value of the DNS record comment. This is a convenience alias for `comment.exact`.",
			optional: true,
			parse: String,
		},
		"comment-present": {
			kind: "parsed",
			brief:
				"If this parameter is present, only records *with* a comment are returned.",
			optional: true,
			parse: String,
		},
		"comment-absent": {
			kind: "parsed",
			brief:
				"If this parameter is present, only records *without* a comment are returned.",
			optional: true,
			parse: String,
		},
		"comment-exact": {
			kind: "parsed",
			brief:
				"Exact value of the DNS record comment. Comment filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"comment-contains": {
			kind: "parsed",
			brief:
				"Substring of the DNS record comment. Comment filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"comment-startswith": {
			kind: "parsed",
			brief:
				"Prefix of the DNS record comment. Comment filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"comment-endswith": {
			kind: "parsed",
			brief:
				"Suffix of the DNS record comment. Comment filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		tag: {
			kind: "parsed",
			brief:
				"Condition on the DNS record tag.\n\nParameter values can be of the form `<tag-name>:<tag-value>` to search for an exact `name:value` pair, or just `<tag-name>` to search for records with a specific tag name regardless of its value.\n\nThis is a convenience shorthand for the more powerful `tag.<predicate>` parameters.\nExamples:\n- `tag=important` is equivalent to `tag.present=important`\n- `tag=team:DNS` is equivalent to `tag.exact=team:DNS`",
			optional: true,
			parse: String,
		},
		"tag-present": {
			kind: "parsed",
			brief:
				"Name of a tag which must be present on the DNS record. Tag filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"tag-absent": {
			kind: "parsed",
			brief:
				"Name of a tag which must *not* be present on the DNS record. Tag filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"tag-exact": {
			kind: "parsed",
			brief:
				"A tag and value, of the form `<tag-name>:<tag-value>`. The API will only return DNS records that have a tag named `<tag-name>` whose value is `<tag-value>`. Tag filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"tag-contains": {
			kind: "parsed",
			brief:
				"A tag and value, of the form `<tag-name>:<tag-value>`. The API will only return DNS records that have a tag named `<tag-name>` whose value contains `<tag-value>`. Tag filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"tag-startswith": {
			kind: "parsed",
			brief:
				"A tag and value, of the form `<tag-name>:<tag-value>`. The API will only return DNS records that have a tag named `<tag-name>` whose value starts with `<tag-value>`. Tag filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		"tag-endswith": {
			kind: "parsed",
			brief:
				"A tag and value, of the form `<tag-name>:<tag-value>`. The API will only return DNS records that have a tag named `<tag-name>` whose value ends with `<tag-value>`. Tag filters are case-insensitive.",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Allows searching in multiple properties of a DNS record simultaneously. This parameter is intended for human users, not automation. Its exact behavior is intentionally left unspecified and is subject to change in the future. This parameter works independently of the `match` setting. For automated searches, please use the other available parameters.",
			optional: true,
			parse: String,
		},
		"tag-match": {
			kind: "enum",
			brief:
				"Whether to match all tag search requirements or at least one (any). If set to `all`, acts like a logical AND between tag filters. If set to `any`, acts like a logical OR instead. Note that the regular `match` parameter is still used to combine the resulting condition with other filters that aren't related to tags. The legacy `tag-match` parameter is an alias for this parameter.",
			values: ["any", "all"],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token for cursor pagination, obtained from `result_info.cursor` of the previous response. An empty value starts cursor pagination. Mutually exclusive with `page` and `prev_cursor`.",
			optional: true,
			parse: String,
		},
		"prev-cursor": {
			kind: "parsed",
			brief:
				"Opaque token for requesting the previous page in cursor pagination, obtained from `result_info.prev_cursor` of the previous response. Mutually exclusive with `page` and `cursor`.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number for offset pagination.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of DNS records per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order DNS records by.",
			values: [
				"type",
				"name",
				"content",
				"ttl",
				"proxied",
				"created_on",
				"modified_on",
			],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order DNS records in.",
			values: ["asc", "desc"],
			optional: true,
		},
		"include-shadow-metadata": {
			kind: "boolean",
			brief:
				"Whether to include shadow metadata in the `meta` field of each record in the response. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
			optional: true,
		},
		"shadowed-by-name": {
			kind: "parsed",
			brief:
				"Filters the response to records at or below the specified NS delegation name. NS, DS, and NSEC records at the delegation name are excluded because they are not shadowed by that delegation. Those record types are included only when they exist below the delegation. The value must be a non-apex subdomain of the zone. Requires `include_shadow_metadata=true`. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
			optional: true,
			parse: String,
		},
		"shadowing-name": {
			kind: "parsed",
			brief:
				"Returns NS records that shadow the given name, searching at the name itself and each of its ancestor names within the zone, excluding the zone apex. The value must be a subdomain of the zone; the zone apex is not accepted. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List DNS Records",
	usage:
		"$0 dns records list\n\nList, search, sort, and filter a zone's DNS records. Requests with `cursor` or `prev_cursor` use cursor pagination. Otherwise, the endpoint uses offset pagination. To start cursor pagination, set `cursor` to an empty value, then pass `result_info.cursor` from the previous response to request the next page. Cursor-paginated responses do not include `page`, `total_count`, or `total_pages`. Cursor tokens are opaque and can vary in length. Pass them back unchanged and do not assume a fixed length.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
