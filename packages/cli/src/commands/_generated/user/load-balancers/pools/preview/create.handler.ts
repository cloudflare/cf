import operation from "../../../../_operations/user/load-balancers/pools/preview/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user load-balancers pools preview create",
			classification: {
				safeFlags: ["allow-insecure", "follow-redirects", "type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf user load-balancers pools preview create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/user/load_balancers/pools/${argv["pool-id"] == null ? "<pool-id>" : encodeURIComponent(String(argv["pool-id"]))}/preview`,
					pathParams: { "pool-id": String(argv["pool-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										allow_insecure: argv["allow-insecure"],
										consecutive_down: argv["consecutive-down"],
										consecutive_up: argv["consecutive-up"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										expected_body: resolveFileToken(
											argv["expected-body"] as string | undefined,
											"expected-body",
											"text"
										),
										expected_codes: resolveFileToken(
											argv["expected-codes"] as string | undefined,
											"expected-codes",
											"text"
										),
										follow_redirects: argv["follow-redirects"],
										header: parseJsonMap(argv["header"], "header"),
										interval: argv["interval"],
										method: resolveFileToken(
											argv["method"] as string | undefined,
											"method",
											"text"
										),
										path: resolveFileToken(
											argv["path"] as string | undefined,
											"path",
											"text"
										),
										port: argv["port"],
										probe_zone: resolveFileToken(
											argv["probe-zone"] as string | undefined,
											"probe-zone",
											"text"
										),
										retries: argv["retries"],
										timeout: argv["timeout"],
										type: argv["type"],
									},
									[["header"]]
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, pool_id: argv["pool-id"] })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					allow_insecure: argv["allow-insecure"],
					consecutive_down: argv["consecutive-down"],
					consecutive_up: argv["consecutive-up"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					expected_body: resolveFileToken(
						argv["expected-body"] as string | undefined,
						"expected-body",
						"text"
					),
					expected_codes: resolveFileToken(
						argv["expected-codes"] as string | undefined,
						"expected-codes",
						"text"
					),
					follow_redirects: argv["follow-redirects"],
					header: parseJsonMap(argv["header"], "header"),
					interval: argv["interval"],
					method: resolveFileToken(
						argv["method"] as string | undefined,
						"method",
						"text"
					),
					path: resolveFileToken(
						argv["path"] as string | undefined,
						"path",
						"text"
					),
					port: argv["port"],
					probe_zone: resolveFileToken(
						argv["probe-zone"] as string | undefined,
						"probe-zone",
						"text"
					),
					retries: argv["retries"],
					timeout: argv["timeout"],
					type: argv["type"],
				},
				[["header"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, pool_id: argv["pool-id"] })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
