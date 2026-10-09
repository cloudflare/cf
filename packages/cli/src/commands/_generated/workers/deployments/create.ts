import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/workers.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getWorkerName,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers deployments create\n\nDeployments configure how [Worker Versions](https://developers.cloudflare.com/api/operations/worker-versions-list-versions) are deployed to traffic. A deployment can consist of multiple versions of a Worker."
		)
		.option("worker", {
			type: "string",
			alias: "script-name",
			description: "Name of the script.",
		})
		.option("bypass-deployment-checks", {
			type: "boolean",
			description:
				"If set to true, the deployment will be created even if normally blocked by something such rolling back to an older version when a secret has changed.",
		})
		.option("strategy", {
			type: "string",
			description: "The strategy field",
			choices: ["percentage"],
		})
		.coerce("strategy", (value) => resolveFileToken(value, "strategy", "text"))
		.option("versions", {
			type: "string",
			description:
				'Worker versions included in this deployment. Each object must contain a `version_id` UUID and a `percentage`; percentages across all objects must total 100. In the `cf` CLI, pass the entire array as one JSON value to `--versions`, either inline, for example `--versions \'[{"version_id":"023e105f-2a42-4f8b-a1c1-73f6a2a30c0f","percentage":100}]\'`, or from a JSON file with `--versions @versions.json`. Provide as a JSON array of objects or @path/to/file.json.',
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

type Request = SdkRequest<"worker-deployments-create-deployment">;
type Body = Request["body"];
type Query = SdkQuery<"worker-deployments-create-deployment">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Worker Deployment",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers deployments create",
				classification: {
					safeFlags: ["bypass-deployment-checks", "strategy", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					force: argv["bypass-deployment-checks"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers deployments create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/scripts/${argv["worker"] ?? "<worker>"}/deployments`,
						pathParams: { "script-name": String(argv["script-name"] ?? "") },
						query: queryParams,
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										strategy: argv["strategy"],
										versions: parseObjectArray(argv["versions"], "versions"),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;
				const scriptName = getWorkerName({ scriptName: argv["worker"] });
				argv["worker"] = scriptName;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Creating`, async () =>
						client.workers.deployments.create({
							body: bodyData,
							account_id: accountId,
							script_name: scriptName,
							...queryParams,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["strategy"] === undefined) {
					argv["strategy"] = await promptForRequiredEnumField(
						"strategy",
						"The strategy field",
						["percentage"] as const
					);
				}
				if (argv["versions"] === undefined) {
					throw new Error(
						"--versions is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					strategy: argv["strategy"],
					versions: parseObjectArray(argv["versions"], "versions"),
				});
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.workers.deployments.create({
						body: bodyData,
						account_id: accountId,
						script_name: scriptName,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
