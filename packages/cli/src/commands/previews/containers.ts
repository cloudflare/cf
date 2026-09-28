import { getLogLevel, setLogLevel } from "@cloudflare/cli-shared-helpers";
import {
	apply,
	cleanupBuiltImages,
	listDurableObjects,
	pushBuiltContainerImage,
	pushImageIfChanged,
} from "@cloudflare/containers-shared";
import { getDockerPath } from "@cloudflare/workers-utils";
import type {
	ContainerNormalizedConfig,
	ImageRef,
} from "@cloudflare/containers-shared";
import type {
	ContainerDeployConfig,
	PreviewCallbacks,
} from "@cloudflare/deploy-helpers";
import type { Config } from "@cloudflare/workers-utils";

export function createPreviewContainerCallbacks(
	containerDeployConfig: ContainerDeployConfig
): PreviewCallbacks {
	return {
		getNormalizedContainerOptions: async (config) =>
			containerDeployConfig.standard.normalized.map((container) => ({
				...container,
				name:
					config.containers?.find(
						({ class_name }) => class_name === container.class_name
					)?.name ?? container.name,
			})),
		deployPreviewContainers: async (
			config,
			containers,
			deployment,
			accountId,
			options
		) =>
			withQuietContainerOutput(options.quiet, async () => {
				const namespaceIds = new Map<string, string>();
				for (const binding of Object.values(deployment.env ?? {})) {
					if (
						binding.type === "durable_object_namespace" &&
						binding.class_name &&
						binding.namespace_id &&
						binding.script_name === undefined
					) {
						namespaceIds.set(binding.class_name, binding.namespace_id);
					}
				}

				let namespaces:
					| Awaited<ReturnType<typeof listDurableObjects>>
					| undefined;
				for (const container of containers) {
					let namespaceId = namespaceIds.get(container.class_name);
					if (!namespaceId) {
						namespaces ??= await listDurableObjects(config, accountId);
						namespaceId = namespaces.find(
							(namespace) =>
								namespace.class === container.class_name &&
								namespace.preview?.id === deployment.preview_id
						)?.id;
					}
					if (!namespaceId) {
						throw new Error(
							`Could not find a Preview Durable Object namespace for Container class "${container.class_name}".`
						);
					}

					const imageRef = await resolvePreviewImage(
						container,
						containerDeployConfig,
						deployment.id,
						accountId,
						config,
						options.localImageReferences?.get(container.class_name)
					);
					await apply(
						{ imageRef, durable_object_namespace_id: namespaceId },
						container,
						config,
						accountId
					);
				}

				await cleanupBuiltImages(
					containerDeployConfig.standard.builtImages.filter(
						({ container }) =>
							!options.localImageReferences?.has(container.class_name)
					),
					getDockerPath()
				);
			}),
	};
}

async function withQuietContainerOutput<T>(
	quiet: boolean,
	task: () => Promise<T>
): Promise<T> {
	if (!quiet) {
		return task();
	}

	const previousLogLevel = getLogLevel();
	setLogLevel("error");
	try {
		return await task();
	} finally {
		setLogLevel(previousLogLevel);
	}
}

async function resolvePreviewImage(
	container: ContainerNormalizedConfig,
	containerDeployConfig: ContainerDeployConfig,
	deploymentId: string,
	accountId: string,
	config: Config,
	localImageReference: string | undefined
): Promise<ImageRef> {
	if (localImageReference !== undefined) {
		return pushImageIfChanged({
			pathToDocker: getDockerPath(),
			sourceTag: localImageReference,
			targetTag: localImageReference,
			accountId,
			complianceConfig: config,
			containerConfig: "dockerfile" in container ? container : undefined,
			cleanupSourceTag: false,
		});
	}
	const builtImage = containerDeployConfig.standard.builtImages.find(
		({ container: builtContainer }) =>
			builtContainer.class_name === container.class_name
	);
	if (builtImage) {
		return pushBuiltContainerImage(
			builtImage,
			deploymentId,
			getDockerPath(),
			accountId,
			config
		);
	}

	if ("image_uri" in container) {
		return { newTag: container.image_uri };
	}

	throw new Error(
		`Container "${container.name}" has no Build Output image to deploy.`
	);
}
