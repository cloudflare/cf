import operation from "../../_operations/load-balancers/monitors/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "load-balancers monitors update",
			classification: {
				safeFlags: ["allow-insecure", "follow-redirects", "type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf load-balancers monitors update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/load_balancers/monitors/${argv["monitor-id"] == null ? "<monitor-id>" : encodeURIComponent(String(argv["monitor-id"]))}`,
					pathParams: { "monitor-id": String(argv["monitor-id"] ?? "") },
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
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						monitor_id: argv["monitor-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
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
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					monitor_id: argv["monitor-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
