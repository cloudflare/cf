import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers-for-platforms dispatch-namespaces edit <dispatch-namespace>\n\nPatch a Workers for Platforms dispatch namespace. Omitted fields are left unchanged."
		)
		.positional("dispatch-namespace", {
			type: "string",
			description: "Name of the Workers for Platforms dispatch namespace.",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description: "The name of the dispatch namespace.",
		})
		.option("trusted-workers", {
			type: "boolean",
			description:
				'Whether the Workers in the namespace are executed in a "trusted" manner. When a Worker is trusted, it has access to the shared caches for the zone in the Cache API, and has access to the `request.cf` object on incoming Requests. When a Worker is untrusted, caches are not shared across the zone, and `request.cf` is undefined. By default, Workers in a namespace are "untrusted".',
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"namespace-worker-patch-namespace">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <dispatch-namespace>",
	describe: "Patch Workers for Platforms Dispatch Namespace",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers-for-platforms dispatch-namespaces edit",
				classification: {
					safeFlags: ["trusted-workers", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers-for-platforms dispatch-namespaces edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}`,
						pathParams: {
							"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										trusted_workers: argv["trusted-workers"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.workersForPlatforms.dispatchNamespaces.edit({
							...bodyData,
							account_id: accountId,
							dispatch_namespace: argv["dispatch-namespace"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					trusted_workers: argv["trusted-workers"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.workersForPlatforms.dispatchNamespaces.edit({
						...bodyData,
						account_id: accountId,
						dispatch_namespace: argv["dispatch-namespace"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
