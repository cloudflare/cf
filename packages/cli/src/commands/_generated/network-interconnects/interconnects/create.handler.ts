import operation from "../../_operations/network-interconnects/interconnects/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "network-interconnects interconnects create",
			classification: {
				safeFlags: ["bandwidth", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["account"] === undefined) {
					argv["account"] = await promptForRequiredField(
						"account",
						"The account field"
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredField("type", "The type field");
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf network-interconnects interconnects create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/interconnects`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									account: resolveFileToken(
										argv["account"] as string | undefined,
										"account",
										"text"
									),
									type: resolveFileToken(
										argv["type"] as string | undefined,
										"type",
										"text"
									),
									slot_id: resolveFileToken(
										argv["slot-id"] as string | undefined,
										"slot-id",
										"text"
									),
									speed: resolveFileToken(
										argv["speed"] as string | undefined,
										"speed",
										"text"
									),
									bandwidth: argv["bandwidth"],
									pairing_key: resolveFileToken(
										argv["pairing-key"] as string | undefined,
										"pairing-key",
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
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				account: resolveFileToken(
					argv["account"] as string | undefined,
					"account",
					"text"
				),
				type: resolveFileToken(
					argv["type"] as string | undefined,
					"type",
					"text"
				),
				slot_id: resolveFileToken(
					argv["slot-id"] as string | undefined,
					"slot-id",
					"text"
				),
				speed: resolveFileToken(
					argv["speed"] as string | undefined,
					"speed",
					"text"
				),
				bandwidth: argv["bandwidth"],
				pairing_key: resolveFileToken(
					argv["pairing-key"] as string | undefined,
					"pairing-key",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
