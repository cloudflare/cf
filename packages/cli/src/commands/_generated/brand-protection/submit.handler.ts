import operation from "../_operations/brand-protection/submit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./submit.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "brand-protection submit",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				showHistoric: argv["show-historic"],
				download: argv["download"],
			};
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["image-data"] === undefined) {
					argv["image-data"] = await promptForRequiredField(
						"image-data",
						"Base64 encoded image data. Can include data URI prefix (e.g., 'data:image/png;base64,...') or just the base64 string."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf brand-protection submit",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/logo/search`,
					pathParams: {},
					query: queryParams,
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									image_data: resolveFileToken(
										argv["image-data"] as string | undefined,
										"image-data",
										"text"
									),
									score_threshold: argv["score-threshold"],
									top_k: argv["top-k"],
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
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				image_data: resolveFileToken(
					argv["image-data"] as string | undefined,
					"image-data",
					"text"
				),
				score_threshold: argv["score-threshold"],
				top_k: argv["top-k"],
			});
			const qs = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([, v]) => v !== undefined)
					.map(([k, v]) => [k, String(v)])
			).toString();
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
