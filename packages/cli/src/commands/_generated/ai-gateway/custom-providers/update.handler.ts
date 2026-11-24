import operation from "../../_operations/ai-gateway/custom-providers/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ai-gateway custom-providers update",
			classification: {
				safeFlags: ["beta", "enable", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-gateway custom-providers update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/custom-providers/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
					pathParams: { id: String(argv["id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									base_url: resolveFileToken(
										argv["base-url"] as string | undefined,
										"base-url",
										"text"
									),
									beta: argv["beta"],
									curl_example: resolveFileToken(
										argv["curl-example"] as string | undefined,
										"curl-example",
										"text"
									),
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									enable: argv["enable"],
									headers: resolveFileToken(
										argv["headers"] as string | undefined,
										"headers",
										"text"
									),
									js_example: resolveFileToken(
										argv["js-example"] as string | undefined,
										"js-example",
										"text"
									),
									link: resolveFileToken(
										argv["link"] as string | undefined,
										"link",
										"text"
									),
									logo: resolveFileToken(
										argv["logo"] as string | undefined,
										"logo",
										"text"
									),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									position: argv["position"],
									slug: resolveFileToken(
										argv["slug"] as string | undefined,
										"slug",
										"text"
									),
								}),
					sensitiveBodyPaths: [["headers"]],
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
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				base_url: resolveFileToken(
					argv["base-url"] as string | undefined,
					"base-url",
					"text"
				),
				beta: argv["beta"],
				curl_example: resolveFileToken(
					argv["curl-example"] as string | undefined,
					"curl-example",
					"text"
				),
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				enable: argv["enable"],
				headers: resolveFileToken(
					argv["headers"] as string | undefined,
					"headers",
					"text"
				),
				js_example: resolveFileToken(
					argv["js-example"] as string | undefined,
					"js-example",
					"text"
				),
				link: resolveFileToken(
					argv["link"] as string | undefined,
					"link",
					"text"
				),
				logo: resolveFileToken(
					argv["logo"] as string | undefined,
					"logo",
					"text"
				),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				position: argv["position"],
				slug: resolveFileToken(
					argv["slug"] as string | undefined,
					"slug",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					id: argv["id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
