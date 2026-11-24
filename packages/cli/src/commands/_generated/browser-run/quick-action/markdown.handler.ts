import operation from "../../_operations/browser-run/quick-action/markdown.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./markdown.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
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
			command: "browser-run quick-action markdown",
			classification: {
				safeFlags: [
					"browser",
					"best-attempt",
					"set-java-script-enabled",
					"viewport-has-touch",
					"viewport-is-landscape",
					"viewport-is-mobile",
					"wait-for-selector-hidden",
					"wait-for-selector-visible",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				cacheTTL: argv["cache-ttl"],
				browser: argv["browser"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf browser-run quick-action markdown",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/markdown`,
					pathParams: {},
					query: queryParams,
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										actionTimeout: argv["action-timeout"],
										addScriptTag: parseObjectArray(
											argv["add-script-tag"],
											"add-script-tag"
										),
										addStyleTag: parseObjectArray(
											argv["add-style-tag"],
											"add-style-tag"
										),
										allowRequestPattern: argv["allow-request-pattern"],
										allowResourceTypes: argv["allow-resource-types"],
										authenticate: {
											password: resolveFileToken(
												argv["authenticate-password"] as string | undefined,
												"authenticate-password",
												"text"
											),
											username: resolveFileToken(
												argv["authenticate-username"] as string | undefined,
												"authenticate-username",
												"text"
											),
										},
										bestAttempt: argv["best-attempt"],
										cookies: parseObjectArray(argv["cookies"], "cookies"),
										emulateMediaType: resolveFileToken(
											argv["emulate-media-type"] as string | undefined,
											"emulate-media-type",
											"text"
										),
										gotoOptions: {
											referer: resolveFileToken(
												argv["goto-options-referer"] as string | undefined,
												"goto-options-referer",
												"text"
											),
											referrerPolicy: resolveFileToken(
												argv["goto-options-referrer-policy"] as
													| string
													| undefined,
												"goto-options-referrer-policy",
												"text"
											),
											timeout: argv["goto-options-timeout"],
										},
										html: resolveFileToken(
											argv["html"] as string | undefined,
											"html",
											"text"
										),
										rejectRequestPattern: argv["reject-request-pattern"],
										rejectResourceTypes: argv["reject-resource-types"],
										setExtraHTTPHeaders: parseJsonMap(
											argv["set-extra-httpheaders"],
											"set-extra-httpheaders"
										),
										setJavaScriptEnabled: argv["set-java-script-enabled"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
										userAgent: resolveFileToken(
											argv["user-agent"] as string | undefined,
											"user-agent",
											"text"
										),
										viewport: {
											deviceScaleFactor: argv["viewport-device-scale-factor"],
											hasTouch: argv["viewport-has-touch"],
											height: argv["viewport-height"],
											isLandscape: argv["viewport-is-landscape"],
											isMobile: argv["viewport-is-mobile"],
											width: argv["viewport-width"],
										},
										waitForSelector: {
											hidden: argv["wait-for-selector-hidden"],
											selector: resolveFileToken(
												argv["wait-for-selector-selector"] as
													| string
													| undefined,
												"wait-for-selector-selector",
												"text"
											),
											timeout: argv["wait-for-selector-timeout"],
											visible: argv["wait-for-selector-visible"],
										},
										waitForTimeout: argv["wait-for-timeout"],
									},
									[["setExtraHTTPHeaders"]]
								),
					sensitiveBodyPaths: [["authenticate", "password"]],
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

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					actionTimeout: argv["action-timeout"],
					addScriptTag: parseObjectArray(
						argv["add-script-tag"],
						"add-script-tag"
					),
					addStyleTag: parseObjectArray(argv["add-style-tag"], "add-style-tag"),
					allowRequestPattern: argv["allow-request-pattern"],
					allowResourceTypes: argv["allow-resource-types"],
					authenticate: {
						password: resolveFileToken(
							argv["authenticate-password"] as string | undefined,
							"authenticate-password",
							"text"
						),
						username: resolveFileToken(
							argv["authenticate-username"] as string | undefined,
							"authenticate-username",
							"text"
						),
					},
					bestAttempt: argv["best-attempt"],
					cookies: parseObjectArray(argv["cookies"], "cookies"),
					emulateMediaType: resolveFileToken(
						argv["emulate-media-type"] as string | undefined,
						"emulate-media-type",
						"text"
					),
					gotoOptions: {
						referer: resolveFileToken(
							argv["goto-options-referer"] as string | undefined,
							"goto-options-referer",
							"text"
						),
						referrerPolicy: resolveFileToken(
							argv["goto-options-referrer-policy"] as string | undefined,
							"goto-options-referrer-policy",
							"text"
						),
						timeout: argv["goto-options-timeout"],
					},
					html: resolveFileToken(
						argv["html"] as string | undefined,
						"html",
						"text"
					),
					rejectRequestPattern: argv["reject-request-pattern"],
					rejectResourceTypes: argv["reject-resource-types"],
					setExtraHTTPHeaders: parseJsonMap(
						argv["set-extra-httpheaders"],
						"set-extra-httpheaders"
					),
					setJavaScriptEnabled: argv["set-java-script-enabled"],
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
					userAgent: resolveFileToken(
						argv["user-agent"] as string | undefined,
						"user-agent",
						"text"
					),
					viewport: {
						deviceScaleFactor: argv["viewport-device-scale-factor"],
						hasTouch: argv["viewport-has-touch"],
						height: argv["viewport-height"],
						isLandscape: argv["viewport-is-landscape"],
						isMobile: argv["viewport-is-mobile"],
						width: argv["viewport-width"],
					},
					waitForSelector: {
						hidden: argv["wait-for-selector-hidden"],
						selector: resolveFileToken(
							argv["wait-for-selector-selector"] as string | undefined,
							"wait-for-selector-selector",
							"text"
						),
						timeout: argv["wait-for-selector-timeout"],
						visible: argv["wait-for-selector-visible"],
					},
					waitForTimeout: argv["wait-for-timeout"],
				},
				[["setExtraHTTPHeaders"]]
			);
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
