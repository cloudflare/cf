import operation from "../../../_operations/user/firewall/access-rules/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user firewall access-rules create",
			classification: {
				safeFlags: ["configuration-target", "access-rule-mode", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["access-rule-mode"] === undefined) {
					argv["access-rule-mode"] = await promptForRequiredEnumField(
						"access-rule-mode",
						"The action to apply to a matched request.",
						[
							"block",
							"challenge",
							"whitelist",
							"js_challenge",
							"managed_challenge",
						] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf user firewall access-rules create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/user/firewall/access_rules/rules`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									configuration: {
										target: argv["configuration-target"],
										value: resolveFileToken(
											argv["configuration-value"] as string | undefined,
											"configuration-value",
											"text"
										),
									},
									mode: argv["access-rule-mode"],
									notes: resolveFileToken(
										argv["notes"] as string | undefined,
										"notes",
										"text"
									),
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				configuration: {
					target: argv["configuration-target"],
					value: resolveFileToken(
						argv["configuration-value"] as string | undefined,
						"configuration-value",
						"text"
					),
				},
				mode: argv["access-rule-mode"],
				notes: resolveFileToken(
					argv["notes"] as string | undefined,
					"notes",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
