import operation from "../../_operations/intel/miscategorizations/create.js";
/**
 * create command
 * @generated from apis/overlays/intel.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create Miscategorization",
	usage:
		"$0 intel miscategorizations create\n\nAllows you to submit requests to change a domain’s category. Requests that include category `169` (New Domains) or category `177` (Newly Seen) in any of `content_adds`, `content_removes`, `security_adds`, or `security_removes` will be rejected with a `400 Bad Request`. These categories are automatically managed and fall off 30 days after they are applied.",
	flags: {
		"content-adds": {
			kind: "parsed",
			brief: "Content category IDs to add.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"content-removes": {
			kind: "parsed",
			brief: "Content category IDs to remove.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "The indicator_type field",
			optional: true,
			choices: ["domain", "ipv4", "ipv6", "url"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "indicator-type", "text"),
		},
		ip: {
			kind: "parsed",
			brief: "Provide only if indicator_type is `ipv4` or `ipv6`.",
			optional: true,
			parse: String,
		},
		"security-adds": {
			kind: "parsed",
			brief: "Security category IDs to add.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"security-removes": {
			kind: "parsed",
			brief: "Security category IDs to remove.",
			variadic: true,
			optional: true,
			parse: String,
		},
		url: {
			kind: "parsed",
			brief:
				"Provide only if indicator_type is `domain` or `url`. Example if indicator_type is `domain`: `example.com`. Example if indicator_type is `url`: `https://example.com/news/`.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel miscategorizations create",
				classification: {
					safeFlags: ["indicator-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel miscategorizations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/miscategorization`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										content_adds: argv["content-adds"],
										content_removes: argv["content-removes"],
										indicator_type: argv["indicator-type"],
										ip: resolveFileToken(
											argv["ip"] as string | undefined,
											"ip",
											"text"
										),
										security_adds: argv["security-adds"],
										security_removes: argv["security-removes"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					content_adds: argv["content-adds"],
					content_removes: argv["content-removes"],
					indicator_type: argv["indicator-type"],
					ip: resolveFileToken(argv["ip"] as string | undefined, "ip", "text"),
					security_adds: argv["security-adds"],
					security_removes: argv["security-removes"],
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
