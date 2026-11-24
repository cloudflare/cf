import operation from "../../_operations/workers/deployments/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	getWorkerName,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["code_update_strategy"],
		selector: "mode",
		variants: [
			{
				values: ["immediate"],
				schema: {
					type: "object",
					properties: { mode: { enum: ["immediate"] } },
					required: ["mode"],
					additionalProperties: false,
				},
			},
			{
				values: ["deferred"],
				schema: {
					type: "object",
					properties: {
						max_delay: { anyOf: [{ type: "number" }, { type: "null" }] },
						mode: { enum: ["deferred"] },
					},
					required: ["mode"],
					additionalProperties: false,
				},
			},
		],
	},
];

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "workers deployments create",
			classification: {
				safeFlags: [
					"bypass-deployment-checks",
					"durable-objects-code-update-mode",
					"strategy",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const scriptName = await getWorkerName({
				scriptName: argv["worker"],
				quiet: argv["quiet"] as boolean | undefined,
			});
			argv["worker"] = scriptName;

			const queryParams: Record<string, unknown> = {
				force: argv["bypass-deployment-checks"],
			};
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["strategy"] === undefined) {
					argv["strategy"] = await promptForRequiredEnumField(
						"strategy",
						"Strategy for routing traffic across the listed versions. \`percentage\` splits traffic according to each version's \`percentage\`.",
						["percentage"] as const
					);
				}
				if (argv["versions"] === undefined) {
					throw new Error(
						"--versions is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf workers deployments create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/scripts/${encodeURIComponent(scriptName)}/deployments`,
					pathParams: { worker: String(argv["worker"] ?? "") },
					query: queryParams,
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: validateBodyUnions(
									compactBody({
										code_update_strategy: {
											mode: argv["durable-objects-code-update-mode"],
											max_delay: argv["durable-objects-code-update-max-delay"],
										},
										strategy: argv["strategy"],
										versions: parseObjectArray(argv["versions"], "versions"),
									}),
									bodyUnions
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						script_name: scriptName,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				code_update_strategy: {
					mode: argv["durable-objects-code-update-mode"],
					max_delay: argv["durable-objects-code-update-max-delay"],
				},
				strategy: argv["strategy"],
				versions: parseObjectArray(argv["versions"], "versions"),
			});
			validateBodyUnions(bodyData, bodyUnions);
			const qs = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([, v]) => v !== undefined)
					.map(([k, v]) => [k, String(v)])
			).toString();
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					script_name: scriptName,
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
