import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/dns.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dns records list\n\nList, search, sort, and filter a zones' DNS records."
		)
		.option("name", {
			type: "string",
			description:
				"Exact value of the DNS record name. This is a convenience alias for `name.exact`.",
		})
		.option("name-exact", {
			type: "string",
			description:
				"Exact value of the DNS record name. Name filters are case-insensitive.",
		})
		.option("name-contains", {
			type: "string",
			description:
				"Substring of the DNS record name. Name filters are case-insensitive.",
		})
		.option("name-startswith", {
			type: "string",
			description:
				"Prefix of the DNS record name. Name filters are case-insensitive.",
		})
		.option("name-endswith", {
			type: "string",
			description:
				"Suffix of the DNS record name. Name filters are case-insensitive.",
		})
		.option("type", {
			type: "string",
			description: "Record type.",
			choices: [
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
		})
		.option("content", {
			type: "string",
			description:
				"Exact value of the DNS record content. This is a convenience alias for `content.exact`.",
		})
		.option("content-exact", {
			type: "string",
			description:
				"Exact value of the DNS record content. Content filters are case-insensitive.",
		})
		.option("content-contains", {
			type: "string",
			description:
				"Substring of the DNS record content. Content filters are case-insensitive.",
		})
		.option("content-startswith", {
			type: "string",
			description:
				"Prefix of the DNS record content. Content filters are case-insensitive.",
		})
		.option("content-endswith", {
			type: "string",
			description:
				"Suffix of the DNS record content. Content filters are case-insensitive.",
		})
		.option("proxied", {
			type: "boolean",
			description:
				"Whether the record is receiving the performance and security benefits of Cloudflare.",
		})
		.option("match", {
			type: "string",
			description:
				"Whether to match all search requirements or at least one (any). If set to `all`, acts like a logical AND between filters. If set to `any`, acts like a logical OR instead. Note that the interaction between tag filters is controlled by the `tag-match` parameter instead.",
			choices: ["any", "all"],
		})
		.option("comment", {
			type: "string",
			description:
				"Exact value of the DNS record comment. This is a convenience alias for `comment.exact`.",
		})
		.option("comment-present", {
			type: "string",
			description:
				"If this parameter is present, only records *with* a comment are returned.",
		})
		.option("comment-absent", {
			type: "string",
			description:
				"If this parameter is present, only records *without* a comment are returned.",
		})
		.option("comment-exact", {
			type: "string",
			description:
				"Exact value of the DNS record comment. Comment filters are case-insensitive.",
		})
		.option("comment-contains", {
			type: "string",
			description:
				"Substring of the DNS record comment. Comment filters are case-insensitive.",
		})
		.option("comment-startswith", {
			type: "string",
			description:
				"Prefix of the DNS record comment. Comment filters are case-insensitive.",
		})
		.option("comment-endswith", {
			type: "string",
			description:
				"Suffix of the DNS record comment. Comment filters are case-insensitive.",
		})
		.option("tag", {
			type: "string",
			description:
				"Condition on the DNS record tag.\n\nParameter values can be of the form `<tag-name>:<tag-value>` to search for an exact `name:value` pair, or just `<tag-name>` to search for records with a specific tag name regardless of its value.\n\nThis is a convenience shorthand for the more powerful `tag.<predicate>` parameters.\nExamples:\n- `tag=important` is equivalent to `tag.present=important`\n- `tag=team:DNS` is equivalent to `tag.exact=team:DNS`",
		})
		.option("tag-present", {
			type: "string",
			description:
				"Name of a tag which must be present on the DNS record. Tag filters are case-insensitive.",
		})
		.option("tag-absent", {
			type: "string",
			description:
				"Name of a tag which must *not* be present on the DNS record. Tag filters are case-insensitive.",
		})
		.option("tag-exact", {
			type: "string",
			description:
				"A tag and value, of the form `<tag-name>:<tag-value>`. The API will only return DNS records that have a tag named `<tag-name>` whose value is `<tag-value>`. Tag filters are case-insensitive.",
		})
		.option("tag-contains", {
			type: "string",
			description:
				"A tag and value, of the form `<tag-name>:<tag-value>`. The API will only return DNS records that have a tag named `<tag-name>` whose value contains `<tag-value>`. Tag filters are case-insensitive.",
		})
		.option("tag-startswith", {
			type: "string",
			description:
				"A tag and value, of the form `<tag-name>:<tag-value>`. The API will only return DNS records that have a tag named `<tag-name>` whose value starts with `<tag-value>`. Tag filters are case-insensitive.",
		})
		.option("tag-endswith", {
			type: "string",
			description:
				"A tag and value, of the form `<tag-name>:<tag-value>`. The API will only return DNS records that have a tag named `<tag-name>` whose value ends with `<tag-value>`. Tag filters are case-insensitive.",
		})
		.option("search", {
			type: "string",
			description:
				"Allows searching in multiple properties of a DNS record simultaneously. This parameter is intended for human users, not automation. Its exact behavior is intentionally left unspecified and is subject to change in the future. This parameter works independently of the `match` setting. For automated searches, please use the other available parameters.",
		})
		.option("tag-match", {
			type: "string",
			description:
				"Whether to match all tag search requirements or at least one (any). If set to `all`, acts like a logical AND between tag filters. If set to `any`, acts like a logical OR instead. Note that the regular `match` parameter is still used to combine the resulting condition with other filters that aren't related to tags.",
			choices: ["any", "all"],
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of DNS records per page.",
		})
		.option("order", {
			type: "string",
			description: "Field to order DNS records by.",
			choices: ["type", "name", "content", "ttl", "proxied"],
		})
		.option("direction", {
			type: "string",
			description: "Direction to order DNS records in.",
			choices: ["asc", "desc"],
		})
		.option("include-shadow-metadata", {
			type: "boolean",
			description:
				"Whether to include shadow metadata in the `meta` field of each record in the response. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
		})
		.option("shadowed-by-name", {
			type: "string",
			description:
				"Filters to records at or below the given NS delegation name, excluding the NS records that form the delegation itself. The value must be a subdomain of the zone; the zone apex is not accepted. Requires `include_shadow_metadata=true`. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
		})
		.option("shadowing-name", {
			type: "string",
			description:
				"Returns NS records that shadow the given name, searching at the name itself and each of its ancestor names within the zone, excluding the zone apex. The value must be a subdomain of the zone; the zone apex is not accepted. See [Shadowed records](https://developers.cloudflare.com/dns/manage-dns-records/reference/shadowed-records).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"dns-records-for-a-zone-list-dns-records">;
type Query = SdkQuery<"dns-records-for-a-zone-list-dns-records">;

const typedBuilder = withArgTypes<
	{
		type: Query["type"];
		match: Query["match"];
		"tag-match": Query["tag_match"];
		order: Query["order"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List DNS Records",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns records list",
				classification: {
					safeFlags: [
						"type",
						"proxied",
						"match",
						"tag-match",
						"order",
						"direction",
						"include-shadow-metadata",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					include_shadow_metadata: argv["include-shadow-metadata"],
					shadowed_by_name: argv["shadowed-by-name"],
					shadowing_name: argv["shadowing-name"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf dns records list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records`,
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

				const result = await withProgress(`Loading`, async () =>
					client.dns.records.list({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
