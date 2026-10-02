import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
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
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 registrar-sandbox registrations list\n\nReturns a paginated list of domain registrations owned by the account. This endpoint uses cursor-based pagination. Results are ordered by registration date by default. To fetch the next page, pass the `cursor` value from the `result_info` object in the response as the `cursor` query parameter in your next request. An empty `cursor` string indicates there are no more pages."
		)
		.option("cursor", {
			type: "string",
			description:
				"Opaque token from a previous response's `result_info.cursor`.\nPass this value to fetch the next page of results. Omit (or\npass an empty string) for the first page.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items to return per page.",
		})
		.option("direction", {
			type: "string",
			description: "Sort direction for results. Defaults to ascending order.",
			choices: ["asc", "desc"],
		})
		.option("sort-by", {
			type: "string",
			description:
				"Column to sort results by. Defaults to registration date (`registry_created_at`) when omitted.",
			choices: ["registry_created_at", "registry_expires_at", "name"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"sandbox-registrar-domain-registration-list">;
type Query = SdkQuery<"sandbox-registrar-domain-registration-list">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		"sort-by": Query["sort_by"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Registrations",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar-sandbox registrations list",
				classification: {
					safeFlags: ["direction", "sort-by", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					direction: argv["direction"],
					sort_by: argv["sort-by"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar-sandbox registrations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar-sandbox/registrations`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.registrarSandbox.registrations.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
