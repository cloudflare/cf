import operation from "../../../../_operations/zero-trust/identity-providers/scim/users/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "list",
	describe: "List SCIM User resources",
	usage:
		"$0 zero-trust identity-providers scim users list\n\nLists SCIM User resources synced to Cloudflare via the System for Cross-domain Identity Management (SCIM).",
	flags: {
		"identity-provider-id": { kind: "parsed", brief: "UUID.", parse: String },
		"cf-resource-id": {
			kind: "parsed",
			brief:
				'The unique Cloudflare-generated Id of the SCIM User resource; also known as the "Id".\nPass once for a single lookup (`?cf_resource_id=A`) or repeat the parameter\n(`?cf_resource_id=A&cf_resource_id=B`) to look up multiple users in one request,\nup to 50 values. Mutually exclusive with `idp_resource_id`, `username`, `email`,\n`name`, `search_contains`, and `search_starts_with`.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"idp-resource-id": {
			kind: "parsed",
			brief:
				'The IdP-generated Id of the SCIM User resource; also known as the "external Id".\nPass once for a single lookup (`?idp_resource_id=A`) or repeat the parameter\n(`?idp_resource_id=A&idp_resource_id=B`) to look up multiple users in one request,\nup to 50 values. Mutually exclusive with `cf_resource_id`, `username`, `email`,\n`name`, `search_contains`, and `search_starts_with`.',
			variadic: true,
			optional: true,
			parse: String,
		},
		username: {
			kind: "parsed",
			brief: "The username of the SCIM User resource.",
			optional: true,
			parse: String,
		},
		email: {
			kind: "parsed",
			brief: "The email address of the SCIM User resource.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the SCIM User resource.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
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
				command: "zero-trust identity-providers scim users list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cf_resource_id: argv["cf-resource-id"],
					idp_resource_id: argv["idp-resource-id"],
					username: argv["username"],
					email: argv["email"],
					name: argv["name"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust identity-providers scim users list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/identity_providers/${argv["identity-provider-id"] == null ? "<identity-provider-id>" : encodeURIComponent(String(argv["identity-provider-id"]))}/scim/users`,
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
					client.send(operation, {
						account_id: accountId,
						identity_provider_id: argv["identity-provider-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
