import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust identity-providers scim groups list\n\nLists SCIM Group resources synced to Cloudflare via the System for Cross-domain Identity Management (SCIM)."
		)
		.option("identity-provider-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("cf-resource-id", {
			type: "string",
			description:
				'The unique Cloudflare-generated Id of the SCIM Group resource; also known as the "Id".\nPass once for a single lookup (`?cf_resource_id=A`) or repeat the parameter\n(`?cf_resource_id=A&cf_resource_id=B`) to look up multiple groups in one request,\nup to 50 values. Mutually exclusive with `idp_resource_id`, `name`,\n`search_contains`, and `search_starts_with`.',
		})
		.option("idp-resource-id", {
			type: "string",
			description:
				'The IdP-generated Id of the SCIM Group resource; also known as the "external Id".\nPass once for a single lookup (`?idp_resource_id=A`) or repeat the parameter\n(`?idp_resource_id=A&idp_resource_id=B`) to look up multiple groups in one request,\nup to 50 values. Mutually exclusive with `cf_resource_id`, `name`,\n`search_contains`, and `search_starts_with`.',
		})
		.option("name", {
			type: "string",
			description: "The display name of the SCIM Group resource.",
		})
		.option("page", { type: "number", description: "Page number of results." })
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"access-identity-providers-list-scim-group-resources">;
type Query = SdkQuery<"access-identity-providers-list-scim-group-resources">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List SCIM Group resources",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust identity-providers scim groups list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					cf_resource_id: argv["cf-resource-id"],
					idp_resource_id: argv["idp-resource-id"],
					name: argv["name"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust identity-providers scim groups list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/identity_providers/${argv["identity-provider-id"] == null ? "<identity-provider-id>" : encodeURIComponent(String(argv["identity-provider-id"]))}/scim/groups`,
						pathParams: {
							"identity-provider-id": String(
								argv["identity-provider-id"] ?? ""
							),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.identityProviders.scim.groups.list({
						account_id: accountId,
						identity_provider_id: argv["identity-provider-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
