import type { Client } from "#api";
import { log } from "#lib/ui/log.js";
import { sanitizeTerminalText } from "#lib/ui/sanitize.js";
import deleteApplication from "#operations/containers/applications/delete.js";
import listApplications from "#operations/containers/applications/list.js";
import listNamespaces from "#operations/durable-objects/namespaces/list.js";
import getWorker from "#operations/workers/get.js";

type Namespace = {
	id?: string;
	script?: string;
	preview?: unknown;
	dispatch_namespace?: string;
};

type Application = {
	id: string;
	name: string;
	durable_objects?: { namespace_id: string } | null;
};

function listPage<Item, PageInfo>(
	response: unknown
): {
	result: Item[];
	result_info?: PageInfo;
} {
	return Array.isArray(response)
		? { result: response }
		: (response as { result: Item[]; result_info?: PageInfo });
}

export async function findWorkerApplications(
	client: Client,
	accountId: string,
	worker: string
): Promise<{ workerId: string; applications: Application[] }> {
	const target = (await client.send(getWorker, {
		account_id: accountId,
		worker_id: worker,
	})) as { id?: string; name?: string } | null;
	if (
		typeof target?.id !== "string" ||
		!target.id ||
		typeof target.name !== "string" ||
		!target.name
	) {
		throw new Error("The Workers API did not return the Worker's ID and name.");
	}

	const namespaceIds = new Set<string>();
	const perPage = 1000;
	let page = 1;
	let totalPages: number;
	do {
		const { result, result_info: info } = listPage<
			Namespace,
			{
				total_pages?: number;
				total_count?: number;
				per_page?: number;
			}
		>(
			await client.send(listNamespaces, {
				account_id: accountId,
				page,
				per_page: perPage,
			})
		);
		for (const namespace of result) {
			if (
				typeof namespace.id === "string" &&
				namespace.id &&
				namespace.script === target.name &&
				namespace.preview === undefined &&
				namespace.dispatch_namespace === undefined
			) {
				namespaceIds.add(namespace.id);
			}
		}
		totalPages =
			info?.total_pages ??
			Math.ceil((info?.total_count ?? 0) / (info?.per_page || perPage));
		page++;
	} while (page <= totalPages);

	const applications = new Map<string, Application>();
	if (namespaceIds.size > 0) {
		let pageToken: string | undefined;
		const seenTokens = new Set<string>();
		do {
			const { result, result_info: info } = listPage<
				Application,
				{ next_page_token?: string }
			>(
				await client.send(listApplications, {
					account_id: accountId,
					page_token: pageToken,
				})
			);
			for (const application of result) {
				const namespaceId = application.durable_objects?.namespace_id;
				if (namespaceId && namespaceIds.has(namespaceId)) {
					if (
						typeof application.id !== "string" ||
						!application.id ||
						typeof application.name !== "string"
					) {
						throw new Error(
							"The Containers API did not return an owned application's ID and name."
						);
					}
					applications.set(application.id, application);
				}
			}
			pageToken = info?.next_page_token;
			if (pageToken) {
				if (seenTokens.has(pageToken)) {
					throw new Error("The Containers API repeated a pagination token.");
				}
				seenTokens.add(pageToken);
			}
		} while (pageToken);
	}
	return { workerId: target.id, applications: [...applications.values()] };
}

export function describeApplication({ name, id }: Application): string {
	return `${sanitizeTerminalText(name)} (${sanitizeTerminalText(id)})`;
}

function applicationDeleteCommand({ id }: Application): string {
	return `cf containers applications delete ${/^[a-z\d][a-z\d_-]*$/i.test(id) ? id : "<application-id>"}`;
}

export function warnAboutRemainingApplications(
	applications: Application[]
): void {
	log.warn(
		`These Container applications were not deleted and may continue running and billing:\n${applications.map((application) => `- ${describeApplication(application)}`).join("\n")}`,
		...applications.map(applicationDeleteCommand)
	);
}

export async function deleteWorkerApplications(
	client: Client,
	accountId: string,
	applications: Application[]
): Promise<void> {
	let failures = 0;
	for (const application of applications) {
		try {
			await client.send(deleteApplication, {
				account_id: accountId,
				application_id: application.id,
			});
		} catch (error) {
			failures++;
			log.warn(
				`Could not delete Container application ${describeApplication(application)}: ${sanitizeTerminalText(error instanceof Error ? error.message : String(error))}`,
				applicationDeleteCommand(application)
			);
		}
	}
	if (failures < applications.length) {
		log.info(
			"Container application deletion has started. Instances may take a while to shut down."
		);
	}
	if (failures > 0) {
		throw new Error(
			`The Worker was deleted, but ${failures} of ${applications.length} Container application deletions failed.`
		);
	}
}
