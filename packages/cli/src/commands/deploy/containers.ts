import {
	InstanceType,
	SchedulingPolicy,
	resolveImageName,
} from "@cloudflare/containers-shared";
import { isLiveDurableObjectExport } from "@cloudflare/workers-utils";
import { BuildOutputConfigError } from "../../lib/build-output-error.js";
import type { BuildOutputContainers } from "@cloudflare/build-output-utils";
import type { ParsedOutputContainerConfig } from "@cloudflare/config";
import type {
	BuiltContainerImage,
	ContainerNormalizedConfig,
	InstanceTypeOrLimits,
	SharedContainerConfig,
} from "@cloudflare/containers-shared";
import type {
	BuiltDurableObjectContainerImage,
	ContainerDeployConfig,
} from "@cloudflare/deploy-helpers";
import type {
	Config,
	ContainerApp,
	ContainerObservability,
	DurableObjectExport,
	Exports,
	Observability,
} from "@cloudflare/workers-utils";

type OutputImage = { reference: string } | { localReference: string };

interface ContainerWithClass {
	className: string;
	config: ParsedOutputContainerConfig;
}

interface ContainerDeployOptions {
	/** Undefined during a dry run, which leaves registry references as written. */
	accountId: string | undefined;
	containersRollout?: "immediate" | "gradual" | "none";
}

const ROLLOUT_KIND = {
	"full-auto": "full_auto",
	"full-manual": "full_manual",
	none: "none",
} as const;

export function isLiveContainerExport<
	T extends { type: string; state?: string; container?: string },
>(exportConfig: T): exportConfig is T & { container: string } {
	return (
		exportConfig.type === "durable-object" &&
		isLiveDurableObjectExport(exportConfig as DurableObjectExport) &&
		typeof exportConfig.container === "string"
	);
}

/** Convert validated Build Output Containers into deploy-helpers input. */
export function createContainerDeployConfig(
	containers: BuildOutputContainers,
	config: Config,
	options: ContainerDeployOptions
): ContainerDeployConfig {
	const source: ContainerApp[] = [];
	const normalized: ContainerNormalizedConfig[] = [];
	const builtImages: BuiltContainerImage[] = [];
	const durableObjectBuiltImages: BuiltDurableObjectContainerImage[] = [];

	for (const containerWithClass of withClassNames(containers, config.exports)) {
		const { className, config: container } = containerWithClass;
		if (container.schedulingPolicy === "durable-object") {
			const images: NonNullable<ContainerApp["images"]> = {};
			for (const [imageName, image] of Object.entries(container.images ?? {})) {
				if ("reference" in image) {
					images[imageName] = { image: image.reference };
				} else {
					images[imageName] = { dockerfile: image.localReference };
					durableObjectBuiltImages.push({
						className,
						imageName,
						localTag: image.localReference,
					});
				}
			}
			source.push({
				...toCommonContainerApp(container, className),
				scheduling_policy: "durable_object",
				images,
			});
			continue;
		}

		const sourceContainer = toContainerApp(containerWithClass);
		source.push(sourceContainer);
		const normalizedContainer = normalizeStandardContainer(
			{ container, className },
			config,
			options
		);
		normalized.push(normalizedContainer);
		if ("localReference" in container.image) {
			builtImages.push({
				container: normalizedContainer as Extract<
					ContainerNormalizedConfig,
					{ dockerfile: string }
				>,
				localTag: container.image.localReference,
			});
		}
	}

	return {
		source: source.length === 0 ? undefined : source,
		standard: { normalized, builtImages },
		durableObjects: { builtImages: durableObjectBuiltImages },
	};
}

function toContainerApp({
	className,
	config,
}: ContainerWithClass): ContainerApp {
	if (config.schedulingPolicy === "durable-object") {
		return {
			...toCommonContainerApp(config, className),
			scheduling_policy: "durable_object",
			images: Object.fromEntries(
				Object.entries(config.images ?? {}).map(([name, image]) => [
					name,
					"reference" in image
						? { image: image.reference }
						: { dockerfile: image.localReference },
				])
			),
		};
	}

	return {
		...toCommonContainerApp(config, className),
		image: imageReference(config.image),
		max_instances: config.maxInstances,
		...(config.instanceType !== undefined && {
			instance_type: config.instanceType,
		}),
		...(config.schedulingPolicy !== undefined && {
			scheduling_policy: config.schedulingPolicy,
		}),
		...(config.ssh !== undefined && { ssh: config.ssh }),
		...(config.authorizedKeys !== undefined && {
			authorized_keys: config.authorizedKeys.map(({ name, publicKey }) => ({
				name,
				public_key: publicKey,
			})),
		}),
		...(config.constraints !== undefined && {
			constraints: config.constraints,
		}),
		...(config.rollout?.kind !== undefined && {
			rollout_kind: ROLLOUT_KIND[config.rollout.kind],
		}),
		...(config.rollout?.stepPercentage !== undefined && {
			rollout_step_percentage: config.rollout.stepPercentage,
		}),
		...(config.rollout?.activeGracePeriod !== undefined && {
			rollout_active_grace_period: config.rollout.activeGracePeriod,
		}),
	};
}

function withClassNames(
	containers: BuildOutputContainers,
	exports: Exports | undefined
): ContainerWithClass[] {
	const outputCounts = new Map<string, number>();
	for (const { config } of containers) {
		outputCounts.set(config.name, (outputCounts.get(config.name) ?? 0) + 1);
	}

	const classNamesByContainer = new Map<string, string>();
	for (const [className, exportConfig] of Object.entries(exports ?? {})) {
		if (!isLiveContainerExport(exportConfig)) {
			continue;
		}

		const containerName = exportConfig.container;
		if (outputCounts.get(containerName) !== 1) {
			throw new BuildOutputConfigError(
				`Container "${containerName}" referenced by Durable Object export "${className}" must have exactly one Build Output config.`
			);
		}

		const previousClassName = classNamesByContainer.get(containerName);
		if (previousClassName !== undefined) {
			throw new BuildOutputConfigError(
				`Container "${containerName}" is referenced by both Durable Object exports "${previousClassName}" and "${className}".`
			);
		}
		classNamesByContainer.set(containerName, className);
	}

	return containers.flatMap(({ config }) => {
		const className = classNamesByContainer.get(config.name);
		return className === undefined ? [] : [{ config, className }];
	});
}

function toCommonContainerApp(
	config: ParsedOutputContainerConfig,
	className: string
): ContainerApp {
	return {
		name: config.name,
		class_name: className,
		...(config.observability !== undefined && {
			observability: toContainerObservability(config.observability),
		}),
		...(config.unsafe !== undefined && { unsafe: config.unsafe }),
	};
}

function normalizeStandardContainer(
	containerWithClass: {
		container: Exclude<
			ParsedOutputContainerConfig,
			{ schedulingPolicy: "durable-object" }
		>;
		className: string;
	},
	config: Config,
	options: ContainerDeployOptions
): ContainerNormalizedConfig {
	const { container, className } = containerWithClass;
	const rolloutStepFallback = container.maxInstances < 2 ? 100 : [10, 100];
	const shared: SharedContainerConfig = {
		name: container.name,
		class_name: className,
		max_instances: container.maxInstances,
		scheduling_policy: (container.schedulingPolicy ??
			SchedulingPolicy.DEFAULT) as SchedulingPolicy,
		rollout_step_percentage:
			options.containersRollout === "immediate"
				? 100
				: (container.rollout?.stepPercentage ?? rolloutStepFallback),
		rollout_kind:
			options.containersRollout === "none"
				? "none"
				: options.containersRollout === "immediate"
					? "full_auto"
					: container.rollout?.kind === undefined
						? "full_auto"
						: ROLLOUT_KIND[container.rollout.kind],
		rollout_active_grace_period: container.rollout?.activeGracePeriod ?? 0,
		wrangler_ssh: container.ssh,
		authorized_keys: container.authorizedKeys?.map(({ name, publicKey }) => ({
			name,
			public_key: publicKey,
		})),
		constraints: {
			tiers: [1, 2],
			regions: container.constraints?.regions,
			jurisdiction: container.constraints?.jurisdiction,
		},
		observability: normalizeObservability(
			container.observability,
			config.observability
		),
		...normalizeInstanceType(container.instanceType),
	};

	if ("localReference" in container.image) {
		return {
			...shared,
			dockerfile: container.image.localReference,
			// The Docker build has already happened; deploy-helpers only uses this
			// field as the built-image discriminator at this point.
			image_build_context: "",
		};
	}

	return {
		...shared,
		image_uri:
			options.accountId === undefined
				? container.image.reference
				: resolveImageName(
						options.accountId,
						container.image.reference,
						config
					),
	};
}

function normalizeInstanceType(
	instanceType: Exclude<
		ParsedOutputContainerConfig,
		{ schedulingPolicy: "durable-object" }
	>["instanceType"]
): InstanceTypeOrLimits {
	if (instanceType === undefined || typeof instanceType === "string") {
		return {
			instance_type: (instanceType ?? InstanceType.LITE) as InstanceType,
		};
	}
	return {
		disk_bytes: (instanceType.diskMb ?? 2000) * 1_000_000,
		vcpu: instanceType.vcpu ?? 0.0625,
		memory_mib: instanceType.memoryMib ?? 256,
	};
}

function normalizeObservability(
	container: ParsedOutputContainerConfig["observability"],
	root: Observability | undefined
): SharedContainerConfig["observability"] {
	let logsEnabled =
		root?.logs?.enabled === true ||
		(root?.enabled === true && root.logs?.enabled !== false);
	if (container !== undefined) {
		logsEnabled =
			container.logs?.enabled === true ||
			(container.enabled === true && container.logs?.enabled !== false);
	}
	return {
		logs_enabled: logsEnabled,
		...(container !== undefined &&
			"targetInstancePercentage" in container &&
			container.targetInstancePercentage !== undefined && {
				target_instance_percentage: container.targetInstancePercentage,
			}),
		...(container !== undefined &&
			"targetInstanceCount" in container &&
			container.targetInstanceCount !== undefined && {
				target_instance_count: container.targetInstanceCount,
			}),
	};
}

function toContainerObservability(
	observability: ParsedOutputContainerConfig["observability"]
): ContainerObservability | undefined {
	if (observability === undefined) {
		return undefined;
	}
	return {
		enabled:
			observability.logs?.enabled === true ||
			(observability.enabled === true && observability.logs?.enabled !== false),
		logs: observability.logs,
		...("targetInstancePercentage" in observability && {
			target_instance_percentage: observability.targetInstancePercentage,
		}),
		...("targetInstanceCount" in observability && {
			target_instance_count: observability.targetInstanceCount,
		}),
	};
}

function imageReference(image: OutputImage): string {
	return "reference" in image ? image.reference : image.localReference;
}
