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
 * get command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers-for-platforms dispatch-namespaces scripts secrets get <secret-name>\n\nGet a given secret binding (value omitted) on a script uploaded to a Workers for Platforms dispatch namespace."
		)
		.positional("secret-name", {
			type: "string",
			description: "A JavaScript variable name for the secret binding.",
			demandOption: true,
		})
		.option("dispatch-namespace", {
			type: "string",
			description: "Name of the Workers for Platforms dispatch namespace.",
			demandOption: true,
		})
		.option("script-name", {
			type: "string",
			description: "Name of the script.",
			demandOption: true,
		})
		.option("url-encoded", {
			type: "boolean",
			description:
				"Flag that indicates whether the secret name is URL encoded.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"namespace-worker-get-script-secrets">;
type Query = SdkQuery<"namespace-worker-get-script-secrets">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <secret-name>",
	describe: "Get Workers for Platforms Script Secret",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"workers-for-platforms dispatch-namespaces scripts secrets get",
				classification: {
					safeFlags: ["url-encoded", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					url_encoded: argv["url-encoded"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf workers-for-platforms dispatch-namespaces scripts secrets get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/secrets/${argv["secret-name"] == null ? "<secret-name>" : encodeURIComponent(String(argv["secret-name"]))}`,
						pathParams: {
							"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
							"script-name": String(argv["script-name"] ?? ""),
							"secret-name": String(argv["secret-name"] ?? ""),
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
					client.workersForPlatforms.dispatchNamespaces.scripts.secrets.get({
						account_id: accountId,
						dispatch_namespace: argv["dispatch-namespace"],
						script_name: argv["script-name"],
						secret_name: argv["secret-name"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
