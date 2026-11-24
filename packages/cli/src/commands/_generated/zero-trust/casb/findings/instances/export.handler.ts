import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./export.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust casb findings instances export",
			classification: {
				safeFlags: ["archived", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust casb findings instances export",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/findings/${argv["finding-namespace-id"] == null ? "<finding-namespace-id>" : encodeURIComponent(String(argv["finding-namespace-id"]))}/instances/export`,
					pathParams: {
						"finding-namespace-id": String(argv["finding-namespace-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									archived: argv["archived"],
									max_affliction_date: resolveFileToken(
										argv["max-affliction-date"] as string | undefined,
										"max-affliction-date",
										"text"
									),
									min_affliction_date: resolveFileToken(
										argv["min-affliction-date"] as string | undefined,
										"min-affliction-date",
										"text"
									),
									orders: parseObjectArray(argv["orders"], "orders"),
									search: resolveFileToken(
										argv["search"] as string | undefined,
										"search",
										"text"
									),
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
				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/data-security/posture/findings/${encodeURIComponent(String(argv["finding-namespace-id"]))}/instances/export`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["archived"] !== undefined)
				setNestedValue(bodyData, ["archived"], argv["archived"]);
			if (argv["max-affliction-date"] !== undefined)
				setNestedValue(
					bodyData,
					["max_affliction_date"],
					resolveFileToken(
						argv["max-affliction-date"] as string | undefined,
						"max-affliction-date",
						"text"
					)
				);
			if (argv["min-affliction-date"] !== undefined)
				setNestedValue(
					bodyData,
					["min_affliction_date"],
					resolveFileToken(
						argv["min-affliction-date"] as string | undefined,
						"min-affliction-date",
						"text"
					)
				);
			if (argv["orders"] !== undefined)
				setNestedValue(
					bodyData,
					["orders"],
					parseObjectArray(argv["orders"], "orders")
				);
			if (argv["search"] !== undefined)
				setNestedValue(
					bodyData,
					["search"],
					resolveFileToken(
						argv["search"] as string | undefined,
						"search",
						"text"
					)
				);
			const result = await withProgress(`Loading`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/data-security/posture/findings/${encodeURIComponent(String(argv["finding-namespace-id"]))}/instances/export`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
