import operation from "../../../../_operations/zero-trust/devices/posture/rules/create.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust devices posture rules create",
			classification: {
				safeFlags: [
					"input-exists",
					"input-operating-system",
					"input-operator",
					"input-enabled",
					"input-require-all",
					"input-check-private-key",
					"input-compliance-status",
					"input-state",
					"input-version-operator",
					"input-count-operator",
					"input-risk-level",
					"input-score-operator",
					"input-infected",
					"input-is-active",
					"input-network-status",
					"input-operational-state",
					"type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the device posture rule."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type of device posture rule.",
						[
							"file",
							"application",
							"tanium",
							"gateway",
							"warp",
							"disk_encryption",
							"serial_number",
							"sentinelone",
							"carbonblack",
							"firewall",
							"os_version",
							"domain_joined",
							"client_certificate",
							"client_certificate_v2",
							"antivirus",
							"unique_client_id",
							"kolide",
							"tanium_s2s",
							"crowdstrike_s2s",
							"intune",
							"workspace_one",
							"sentinelone_s2s",
							"custom_s2s",
						] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust devices posture rules create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/posture`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									expiration: resolveFileToken(
										argv["expiration"] as string | undefined,
										"expiration",
										"text"
									),
									input: {
										exists: argv["input-exists"],
										operating_system: argv["input-operating-system"],
										path: resolveFileToken(
											argv["input-path"] as string | undefined,
											"input-path",
											"text"
										),
										sha256: resolveFileToken(
											argv["input-sha256"] as string | undefined,
											"input-sha256",
											"text"
										),
										thumbprint: resolveFileToken(
											argv["input-thumbprint"] as string | undefined,
											"input-thumbprint",
											"text"
										),
										id: resolveFileToken(
											argv["input-id"] as string | undefined,
											"input-id",
											"text"
										),
										domain: resolveFileToken(
											argv["input-domain"] as string | undefined,
											"input-domain",
											"text"
										),
										operator: argv["input-operator"],
										os_distro_name: resolveFileToken(
											argv["input-os-distro-name"] as string | undefined,
											"input-os-distro-name",
											"text"
										),
										os_distro_revision: resolveFileToken(
											argv["input-os-distro-revision"] as string | undefined,
											"input-os-distro-revision",
											"text"
										),
										os_version_extra: resolveFileToken(
											argv["input-os-version-extra"] as string | undefined,
											"input-os-version-extra",
											"text"
										),
										version: resolveFileToken(
											argv["input-version"] as string | undefined,
											"input-version",
											"text"
										),
										enabled: argv["input-enabled"],
										checkDisks: argv["input-check-disks"],
										requireAll: argv["input-require-all"],
										certificate_id: resolveFileToken(
											argv["input-certificate-id"] as string | undefined,
											"input-certificate-id",
											"text"
										),
										cn: resolveFileToken(
											argv["input-cn"] as string | undefined,
											"input-cn",
											"text"
										),
										check_private_key: argv["input-check-private-key"],
										extended_key_usage: argv["input-extended-key-usage"],
										locations: {
											paths: argv["input-locations-paths"],
											trust_stores: argv["input-locations-trust-stores"],
										},
										subject_alternative_names:
											argv["input-subject-alternative-names"],
										update_window_days: argv["input-update-window-days"],
										compliance_status: argv["input-compliance-status"],
										connection_id: resolveFileToken(
											argv["input-connection-id"] as string | undefined,
											"input-connection-id",
											"text"
										),
										last_seen: resolveFileToken(
											argv["input-last-seen"] as string | undefined,
											"input-last-seen",
											"text"
										),
										os: resolveFileToken(
											argv["input-os"] as string | undefined,
											"input-os",
											"text"
										),
										overall: resolveFileToken(
											argv["input-overall"] as string | undefined,
											"input-overall",
											"text"
										),
										sensor_config: resolveFileToken(
											argv["input-sensor-config"] as string | undefined,
											"input-sensor-config",
											"text"
										),
										state: argv["input-state"],
										versionOperator: argv["input-version-operator"],
										auth_state: argv["input-auth-state"],
										countOperator: argv["input-count-operator"],
										issue_count: resolveFileToken(
											argv["input-issue-count"] as string | undefined,
											"input-issue-count",
											"text"
										),
										eid_last_seen: resolveFileToken(
											argv["input-eid-last-seen"] as string | undefined,
											"input-eid-last-seen",
											"text"
										),
										risk_level: argv["input-risk-level"],
										scoreOperator: argv["input-score-operator"],
										total_score: argv["input-total-score"],
										active_threats: argv["input-active-threats"],
										infected: argv["input-infected"],
										is_active: argv["input-is-active"],
										network_status: argv["input-network-status"],
										operational_state: argv["input-operational-state"],
										score: argv["input-score"],
									},
									match: parseObjectArray(argv["match"], "match"),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									schedule: resolveFileToken(
										argv["schedule"] as string | undefined,
										"schedule",
										"text"
									),
									type: argv["type"],
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
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				expiration: resolveFileToken(
					argv["expiration"] as string | undefined,
					"expiration",
					"text"
				),
				input: {
					exists: argv["input-exists"],
					operating_system: argv["input-operating-system"],
					path: resolveFileToken(
						argv["input-path"] as string | undefined,
						"input-path",
						"text"
					),
					sha256: resolveFileToken(
						argv["input-sha256"] as string | undefined,
						"input-sha256",
						"text"
					),
					thumbprint: resolveFileToken(
						argv["input-thumbprint"] as string | undefined,
						"input-thumbprint",
						"text"
					),
					id: resolveFileToken(
						argv["input-id"] as string | undefined,
						"input-id",
						"text"
					),
					domain: resolveFileToken(
						argv["input-domain"] as string | undefined,
						"input-domain",
						"text"
					),
					operator: argv["input-operator"],
					os_distro_name: resolveFileToken(
						argv["input-os-distro-name"] as string | undefined,
						"input-os-distro-name",
						"text"
					),
					os_distro_revision: resolveFileToken(
						argv["input-os-distro-revision"] as string | undefined,
						"input-os-distro-revision",
						"text"
					),
					os_version_extra: resolveFileToken(
						argv["input-os-version-extra"] as string | undefined,
						"input-os-version-extra",
						"text"
					),
					version: resolveFileToken(
						argv["input-version"] as string | undefined,
						"input-version",
						"text"
					),
					enabled: argv["input-enabled"],
					checkDisks: argv["input-check-disks"],
					requireAll: argv["input-require-all"],
					certificate_id: resolveFileToken(
						argv["input-certificate-id"] as string | undefined,
						"input-certificate-id",
						"text"
					),
					cn: resolveFileToken(
						argv["input-cn"] as string | undefined,
						"input-cn",
						"text"
					),
					check_private_key: argv["input-check-private-key"],
					extended_key_usage: argv["input-extended-key-usage"],
					locations: {
						paths: argv["input-locations-paths"],
						trust_stores: argv["input-locations-trust-stores"],
					},
					subject_alternative_names: argv["input-subject-alternative-names"],
					update_window_days: argv["input-update-window-days"],
					compliance_status: argv["input-compliance-status"],
					connection_id: resolveFileToken(
						argv["input-connection-id"] as string | undefined,
						"input-connection-id",
						"text"
					),
					last_seen: resolveFileToken(
						argv["input-last-seen"] as string | undefined,
						"input-last-seen",
						"text"
					),
					os: resolveFileToken(
						argv["input-os"] as string | undefined,
						"input-os",
						"text"
					),
					overall: resolveFileToken(
						argv["input-overall"] as string | undefined,
						"input-overall",
						"text"
					),
					sensor_config: resolveFileToken(
						argv["input-sensor-config"] as string | undefined,
						"input-sensor-config",
						"text"
					),
					state: argv["input-state"],
					versionOperator: argv["input-version-operator"],
					auth_state: argv["input-auth-state"],
					countOperator: argv["input-count-operator"],
					issue_count: resolveFileToken(
						argv["input-issue-count"] as string | undefined,
						"input-issue-count",
						"text"
					),
					eid_last_seen: resolveFileToken(
						argv["input-eid-last-seen"] as string | undefined,
						"input-eid-last-seen",
						"text"
					),
					risk_level: argv["input-risk-level"],
					scoreOperator: argv["input-score-operator"],
					total_score: argv["input-total-score"],
					active_threats: argv["input-active-threats"],
					infected: argv["input-infected"],
					is_active: argv["input-is-active"],
					network_status: argv["input-network-status"],
					operational_state: argv["input-operational-state"],
					score: argv["input-score"],
				},
				match: parseObjectArray(argv["match"], "match"),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				schedule: resolveFileToken(
					argv["schedule"] as string | undefined,
					"schedule",
					"text"
				),
				type: argv["type"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
