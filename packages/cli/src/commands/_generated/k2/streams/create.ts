import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/k2.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 k2 streams create\n\nCreate a new K2 stream. HTTP is disabled when `http` is omitted. Enabled HTTP requires authentication and allows all origins unless `authentication` or `cors` say otherwise. At least one input must be enabled."
		)
		.option("http-authentication", {
			type: "boolean",
			description:
				"Indicates whether the HTTP endpoint requires an API token with K2 produce permission. When false, the endpoint accepts unauthenticated records. Defaults to true when HTTP is enabled without a stored value.",
		})
		.option("http-cors-origins", {
			type: "string",
			array: true,
			description:
				"Allows browser requests from these HTTP or HTTPS origins. Use a wildcard only as the sole origin. An empty list blocks cross-origin browser requests. Defaults to `['*']` when HTTP is enabled without stored origins.",
		})
		.option("http-enabled", {
			type: "boolean",
			description: "Indicates whether the HTTP endpoint accepts records.",
		})
		.option("name", {
			type: "string",
			description: "Specifies the name of the K2 stream.",
		})
		.option("retention-seconds", {
			type: "number",
			description:
				"Sets the record retention period from 1 hour (3600 seconds) to 30 days (2592000 seconds), inclusive.",
			default: 604800,
		})
		.option("worker-binding-enabled", {
			type: "boolean",
			description:
				"Indicates whether Workers bindings can produce records to the stream.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"http-authentication",
				"http-cors-origins",
				"http-enabled",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["http-enabled"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --http-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = ["worker-binding-enabled"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["worker-binding-enabled"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --worker_binding-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"postV4AccountsByAccount_idK2Streams">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create K2 stream",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "k2 streams create",
				classification: {
					safeFlags: [
						"http-authentication",
						"http-enabled",
						"worker-binding-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf k2 streams create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/k2/streams`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										http: {
											authentication: argv["http-authentication"],
											cors: {
												origins: argv["http-cors-origins"],
											},
											enabled: argv["http-enabled"],
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										retention_seconds: argv["retention-seconds"],
										worker_binding: {
											enabled: argv["worker-binding-enabled"],
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.k2.streams.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Specifies the name of the K2 stream."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					http: {
						authentication: argv["http-authentication"],
						cors: {
							origins: argv["http-cors-origins"],
						},
						enabled: argv["http-enabled"],
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					retention_seconds: argv["retention-seconds"],
					worker_binding: {
						enabled: argv["worker-binding-enabled"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.k2.streams.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
