/**
 * export command
 * @generated from apis/overlays/dns.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "export",
	describe: "Export DNS Records",
	usage:
		'$0 dns records export\n\nExport your [BIND config](https://en.wikipedia.org/wiki/Zone_file "Zone file") through this endpoint. Use the same record filters as the List DNS Records endpoint to export only matching stored records. By default, the SOA record (stored or generated) and assigned apex NS records, where applicable, are included regardless of filters. Secondary zones must have a stored SOA record to export in this mode. Set `include_generated_records=false` to export only matching stored records, without adding the SOA/nameserver section or requiring secondary zones to have an SOA record. Matching stored SOA and NS records are still exported. This may produce a partial zone rather than a complete zone. Workers-managed records are never exported. The export returns at most 5,000,000 matching stored records, in addition to any automatically included SOA and assigned apex NS records. It is not paginated and does not support `page`, `per_page`, `order`, `direction`, `cursor`, or `prev_cursor`. `include_shadow_metadata=true` is required when using `shadowed_by_name`; it does not add shadow metadata to the BIND output. See [the documentation](https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/ "Import and export records") for more information.',
	flags: {
		"include-generated-records": {
			kind: "boolean",
			brief:
				"Whether to add the SOA and assigned apex NS records independently of the record filters. Set to `false` to export only matching stored records. Matching stored SOA and NS records are still exported.",
			optional: true,
		},
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
		"include-shadow-metadata": {
			kind: "boolean",
			brief:
				"Set to `true` to enable the `shadowed_by_name` filter. This does not add shadow metadata to the BIND output.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns records export",
				classification: {
					safeFlags: [
						"include-generated-records",
						"type",
						"proxied",
						"match",
						"tag-match",
						"include-shadow-metadata",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					include_generated_records: argv["include-generated-records"],
					name: argv["name"],
					"name.exact": argv["name-exact"],
					"name.contains": argv["name-contains"],
					"name.startswith": argv["name-startswith"],
					"name.endswith": argv["name-endswith"],
					type: argv["type"],
					content: argv["content"],
					"content.exact": argv["content-exact"],
					"content.contains": argv["content-contains"],
					"content.startswith": argv["content-startswith"],
					"content.endswith": argv["content-endswith"],
					proxied: argv["proxied"],
					match: argv["match"],
					comment: argv["comment"],
					"comment.present": argv["comment-present"],
					"comment.absent": argv["comment-absent"],
					"comment.exact": argv["comment-exact"],
					"comment.contains": argv["comment-contains"],
					"comment.startswith": argv["comment-startswith"],
					"comment.endswith": argv["comment-endswith"],
					tag: argv["tag"],
					"tag.present": argv["tag-present"],
					"tag.absent": argv["tag-absent"],
					"tag.exact": argv["tag-exact"],
					"tag.contains": argv["tag-contains"],
					"tag.startswith": argv["tag-startswith"],
					"tag.endswith": argv["tag-endswith"],
					search: argv["search"],
					tag_match: argv["tag-match"],
					include_shadow_metadata: argv["include-shadow-metadata"],
					shadowed_by_name: argv["shadowed-by-name"],
					shadowing_name: argv["shadowing-name"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns records export",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/export`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const __cfRawBytes = await withProgress(`Loading`, async () =>
					fetchRawBytes(
						`/zones/${argv.zoneId}/dns_records/export${qs ? "?" + qs : ""}`,
						{
							method: "GET",
							local: argv.local === true,
							persistTo: argv.persistTo as string | undefined,
						}
					)
				);
				writeRawOutput(__cfRawBytes.toString("utf-8"));
				return;
			}
		),
});

export default command;
