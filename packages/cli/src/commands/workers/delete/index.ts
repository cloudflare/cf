import {
	deleteWorkerApplications,
	describeApplication,
	findWorkerApplications,
	warnAboutRemainingApplications,
} from "./containers.js";
import {
	deleteContainersDescription,
	deleteWithReferencesDescription,
	description,
	dryRunDescription,
	forceDescription,
	workerAliases,
	workerDescription,
} from "./meta.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getWorkerName,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { CliExit } from "#lib/cli-exit.js";
import { confirm } from "#lib/dialog.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { withTelemetry } from "#lib/telemetry/index.js";
import { log } from "#lib/ui/log.js";
import { sanitizeTerminalText } from "#lib/ui/sanitize.js";
import { theme } from "#lib/ui/theme.js";
import deleteWorker from "#operations/workers/delete.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(`$0 workers delete [worker]\n\n${description}`)
		.positional("worker", { type: "string", description: workerDescription })
		.option("worker", {
			type: "string",
			alias: workerAliases,
			description: workerDescription,
		})
		.group("worker", theme.brand("Options"))
		.option("delete-with-references", {
			type: "boolean",
			description: deleteWithReferencesDescription,
		})
		.option("delete-containers", {
			type: "boolean",
			description: deleteContainersDescription,
			default: false,
		})
		.option("dry-run", {
			type: "boolean",
			description: dryRunDescription,
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: forceDescription,
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete [worker]",
	describe: "Delete Worker",
	builder,
	async handler(argv) {
		const worker = await getWorkerName({
			scriptName: argv.worker,
			quiet: argv.quiet,
		});
		const deleteContainers = argv["delete-containers"];
		if (argv.local && deleteContainers) {
			throw new Error("--delete-containers cannot be used with --local.");
		}
		const query = { force: argv["delete-with-references"] };
		if (argv.dryRun) {
			const accountId = (await resolveAccountIdSilent()) ?? "<account-id>";
			const workerPath = deleteWorker.path({
				account_id: accountId,
				worker_id: worker,
			});
			formatOutput({
				command: "cf workers delete",
				method: deleteWorker.method,
				url: `https://api.cloudflare.com/client/v4${workerPath.replace("%3Caccount-id%3E", "<account-id>")}`,
				pathParams: { worker },
				query,
				bodyKind: "none",
				...(deleteContainers ? { deleteContainers } : {}),
			});
			return;
		}

		const client = await createCommandClient(argv);
		const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
		argv.accountId = accountId;
		const extra = deleteContainers ? " and its Container applications" : "";
		if (
			!(await confirmDelete({
				force: argv.force,
				message: `This will permanently delete the Worker and its associated versions and deployments${extra}. Worker: ${sanitizeTerminalText(worker)}.`,
			}))
		) {
			return;
		}

		const target = argv.local
			? undefined
			: await withProgress("Checking for Container applications", () =>
					findWorkerApplications(client, accountId, worker)
				).catch((error: unknown) => {
					if (error instanceof CliExit) {
						throw error;
					}
					const message = `Could not check for Container applications: ${sanitizeTerminalText(error instanceof Error ? error.message : String(error))}`;
					if (deleteContainers) {
						throw new Error(`The Worker was not deleted. ${message}`, {
							cause: error,
						});
					}
					log.warn(
						`${message}\nAny Container applications owned by this Worker may continue running and billing after deletion.`,
						"cf containers applications list"
					);
					return undefined;
				});
		const applications = target?.applications ?? [];
		const alsoDelete =
			applications.length > 0 &&
			(deleteContainers ||
				(!argv.force &&
					(await confirm(
						`Delete these Container applications as well? They may continue running and billing if left in place.\n${applications.map((application) => `- ${describeApplication(application)}`).join("\n")}`,
						{ defaultValue: false }
					))));
		const result = await withProgress("Deleting", () =>
			client.send(deleteWorker, {
				account_id: accountId,
				worker_id: target?.workerId ?? worker,
				...query,
			})
		);
		if (alsoDelete) {
			await deleteWorkerApplications(client, accountId, applications);
		} else if (applications.length > 0) {
			warnAboutRemainingApplications(applications);
		}
		formatOutput(result, { successLabel: "Deleted" });
	},
};

export default withTelemetry(command, {
	command: "workers delete",
	classification: {
		safeFlags: [
			"delete-containers",
			"delete-with-references",
			"dry-run",
			"force",
		],
		shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
	},
});
