import operation from "../../../_operations/stream/videos/token/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "stream videos token create",
			classification: {
				safeFlags: ["downloadable", "flags-original", "dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf stream videos token create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/token`,
					pathParams: { identifier: String(argv["identifier"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									accessRules: parseObjectArray(
										argv["access-rules"],
										"access-rules"
									),
									downloadable: argv["downloadable"],
									exp: argv["exp"],
									flags: {
										original: argv["flags-original"],
									},
									id: resolveFileToken(
										argv["id"] as string | undefined,
										"id",
										"text"
									),
									nbf: argv["nbf"],
									pem: resolveFileToken(
										argv["pem"] as string | undefined,
										"pem",
										"text"
									),
								}),
					sensitiveBodyPaths: [["pem"]],
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `Provision temporary token? For use at scale, consider creating a signing key instead.`,
				}))
			) {
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						identifier: argv["identifier"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				accessRules: parseObjectArray(argv["access-rules"], "access-rules"),
				downloadable: argv["downloadable"],
				exp: argv["exp"],
				flags: {
					original: argv["flags-original"],
				},
				id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
				nbf: argv["nbf"],
				pem: resolveFileToken(argv["pem"] as string | undefined, "pem", "text"),
			});
			const result = await withProgress(`Processing`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					identifier: argv["identifier"],
				})
			);
			formatOutput(result, { successLabel: `Done` });
		}
	);
}
