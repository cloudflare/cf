import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./query.js";
import { createCommandClient, requestApi } from "#lib/auth.js";
import {
	compactBody,
	mergeBodyPositionals,
	parseBody,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "sql query",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf sql query",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/analytics/sql`,
					pathParams: {},
					bodyKind: argv.file !== undefined ? "octet-stream" : "json",
					body:
						argv.file !== undefined
							? { file: argv.file }
							: argv.body !== undefined
								? mergeBodyPositionals(parseBody(argv.body), [
										{ name: "query", field: "query", value: argv["query"] },
									])
								: compactBody({
										scope: {
											accountTag: resolveFileToken(
												argv["scope-account"] as string | undefined,
												"scope-account",
												"text"
											),
											zoneTag: resolveFileToken(
												argv["scope-zone"] as string | undefined,
												"scope-zone",
												"text"
											),
										},
										time_range: {
											end: resolveFileToken(
												argv["time-until"] as string | undefined,
												"time-until",
												"text"
											),
											start: resolveFileToken(
												argv["time-since"] as string | undefined,
												"time-since",
												"text"
											),
										},
										query: argv["query"],
									}),
				});
				return;
			}
			const parsedBody =
				argv.file !== undefined
					? undefined
					: argv.body !== undefined
						? mergeBodyPositionals(parseBody(argv.body), [
								{ name: "query", field: "query", value: argv["query"] },
							])
						: undefined;
			const client = await createCommandClient(argv);

			if (argv.file !== undefined) {
				const fileContent = readFileForFlag(argv.file);
				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(client, "POST", `/analytics/sql`, {
						body: fileContent,
						headers: { "Content-Type": "text/plain" },
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(client, "POST", `/analytics/sql`, {
						body: bodyData,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["scope-account"] !== undefined)
				setNestedValue(
					bodyData,
					["scope", "accountTag"],
					resolveFileToken(
						argv["scope-account"] as string | undefined,
						"scope-account",
						"text"
					)
				);
			if (argv["scope-zone"] !== undefined)
				setNestedValue(
					bodyData,
					["scope", "zoneTag"],
					resolveFileToken(
						argv["scope-zone"] as string | undefined,
						"scope-zone",
						"text"
					)
				);
			if (argv["time-until"] !== undefined)
				setNestedValue(
					bodyData,
					["time_range", "end"],
					resolveFileToken(
						argv["time-until"] as string | undefined,
						"time-until",
						"text"
					)
				);
			if (argv["time-since"] !== undefined)
				setNestedValue(
					bodyData,
					["time_range", "start"],
					resolveFileToken(
						argv["time-since"] as string | undefined,
						"time-since",
						"text"
					)
				);
			if (argv["query"] !== undefined) bodyData["query"] = argv["query"];
			const result = await withProgress(`Loading`, async () =>
				requestApi<unknown>(client, "POST", `/analytics/sql`, {
					body: bodyData,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
