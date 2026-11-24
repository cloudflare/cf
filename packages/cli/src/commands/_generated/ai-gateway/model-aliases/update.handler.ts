import operation from "../../_operations/ai-gateway/model-aliases/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ai-gateway model-aliases update",
			classification: {
				safeFlags: ["routing-algorithm", "routing-mode", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["models"] === undefined) {
					throw new Error(
						"--models is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-gateway model-aliases update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/model_aliases/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
					pathParams: {
						"gateway-id": String(argv["gateway-id"] ?? ""),
						id: String(argv["id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									models: parseObjectArray(argv["models"], "models"),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									routing: {
										algorithm: argv["routing-algorithm"],
										mode: argv["routing-mode"],
									},
								}),
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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				models: parseObjectArray(argv["models"], "models"),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				routing: {
					algorithm: argv["routing-algorithm"],
					mode: argv["routing-mode"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					gateway_id: argv["gateway-id"],
					id: argv["id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
