import operation from "../../_operations/bot-management/feedback/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "bot-management feedback create",
			classification: {
				safeFlags: ["type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["description"] === undefined) {
					argv["description"] = await promptForRequiredField(
						"description",
						"The description field"
					);
				}
				if (argv["expression"] === undefined) {
					argv["expression"] = await promptForRequiredField(
						"expression",
						"Wirefilter expression describing the traffic being reported."
					);
				}
				if (argv["first-request-seen-at"] === undefined) {
					argv["first-request-seen-at"] = await promptForRequiredField(
						"first-request-seen-at",
						"The first_request_seen_at field"
					);
				}
				if (argv["last-request-seen-at"] === undefined) {
					argv["last-request-seen-at"] = await promptForRequiredField(
						"last-request-seen-at",
						"The last_request_seen_at field"
					);
				}
				if (argv["requests"] === undefined) {
					throw new Error(
						"--requests is required (or pass --body with this field set)."
					);
				}
				if (argv["requests-by-attribute"] === undefined) {
					throw new Error(
						"--requests-by-attribute is required (or pass --body with this field set)."
					);
				}
				if (argv["requests-by-score"] === undefined) {
					throw new Error(
						"--requests-by-score is required (or pass --body with this field set)."
					);
				}
				if (argv["requests-by-score-src"] === undefined) {
					throw new Error(
						"--requests-by-score-src is required (or pass --body with this field set)."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"Type of feedback report.",
						["false_positive", "false_negative"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf bot-management feedback create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/bot_management/feedback`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body, [
									{
										path: ["requests_by_attribute"],
										flag: "requests-by-attribute",
									},
									{ path: ["requests_by_score"], flag: "requests-by-score" },
									{
										path: ["requests_by_score_src"],
										flag: "requests-by-score-src",
									},
								])
							: compactBody(
									{
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										expression: resolveFileToken(
											argv["expression"] as string | undefined,
											"expression",
											"text"
										),
										first_request_seen_at: resolveFileToken(
											argv["first-request-seen-at"] as string | undefined,
											"first-request-seen-at",
											"text"
										),
										last_request_seen_at: resolveFileToken(
											argv["last-request-seen-at"] as string | undefined,
											"last-request-seen-at",
											"text"
										),
										requests: argv["requests"],
										requests_by_attribute: parseJsonMap(
											argv["requests-by-attribute"],
											"requests-by-attribute",
											true
										),
										requests_by_score: parseJsonMap(
											argv["requests-by-score"],
											"requests-by-score",
											true
										),
										requests_by_score_src: parseJsonMap(
											argv["requests-by-score-src"],
											"requests-by-score-src",
											true
										),
										subtype: resolveFileToken(
											argv["subtype"] as string | undefined,
											"subtype",
											"text"
										),
										type: argv["type"],
									},
									[
										["requests_by_attribute"],
										["requests_by_score"],
										["requests_by_score_src"],
									]
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined
					? parseBody(argv.body, [
							{
								path: ["requests_by_attribute"],
								flag: "requests-by-attribute",
							},
							{ path: ["requests_by_score"], flag: "requests-by-score" },
							{
								path: ["requests_by_score_src"],
								flag: "requests-by-score-src",
							},
						])
					: undefined;
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					expression: resolveFileToken(
						argv["expression"] as string | undefined,
						"expression",
						"text"
					),
					first_request_seen_at: resolveFileToken(
						argv["first-request-seen-at"] as string | undefined,
						"first-request-seen-at",
						"text"
					),
					last_request_seen_at: resolveFileToken(
						argv["last-request-seen-at"] as string | undefined,
						"last-request-seen-at",
						"text"
					),
					requests: argv["requests"],
					requests_by_attribute: parseJsonMap(
						argv["requests-by-attribute"],
						"requests-by-attribute",
						true
					),
					requests_by_score: parseJsonMap(
						argv["requests-by-score"],
						"requests-by-score",
						true
					),
					requests_by_score_src: parseJsonMap(
						argv["requests-by-score-src"],
						"requests-by-score-src",
						true
					),
					subtype: resolveFileToken(
						argv["subtype"] as string | undefined,
						"subtype",
						"text"
					),
					type: argv["type"],
				},
				[
					["requests_by_attribute"],
					["requests_by_score"],
					["requests_by_score_src"],
				]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
