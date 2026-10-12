import { describe, expect, it } from "vite-plus/test";
import { createContainerDeployConfig } from "../../../commands/deploy/containers.js";
import { BuildOutputConfigError } from "../../../lib/build-output-error.js";
import type { BuildOutputContainers } from "@cloudflare/build-output-utils";
import type { ParsedOutputContainerConfig } from "@cloudflare/config";
import type { Config, Exports } from "@cloudflare/workers-utils";

const config = {
	observability: { enabled: true },
	exports: durableObjectExports({ ContainerDO: "api" }),
} as Config;

function outputContainers(
	...containers: ParsedOutputContainerConfig[]
): BuildOutputContainers {
	return containers.map((container, index) => ({
		configPath: `/output/container-${index}/container.config.json`,
		config: container,
	}));
}

function durableObjectExports(entries: Record<string, string>): Exports {
	return Object.fromEntries(
		Object.entries(entries).map(([className, container]) => [
			className,
			{ type: "durable-object", storage: "sqlite", container },
		])
	) as Exports;
}

describe("Build Output Containers", () => {
	it("converts every Container returned by Build Output", () => {
		const allContainersConfig = {
			...config,
			exports: durableObjectExports({ FirstDO: "first", SecondDO: "second" }),
		} as Config;
		const result = createContainerDeployConfig(
			outputContainers(
				{
					name: "first",
					image: { reference: "registry.example/first:latest" },
					maxInstances: 1,
				},
				{
					name: "second",
					image: { reference: "registry.example/second:latest" },
					maxInstances: 1,
				}
			),
			allContainersConfig,
			{ accountId: undefined }
		);

		expect(result.source).toEqual([
			expect.objectContaining({ name: "first", class_name: "FirstDO" }),
			expect.objectContaining({ name: "second", class_name: "SecondDO" }),
		]);
	});

	it("ignores Containers not referenced by the selected Worker", () => {
		const result = createContainerDeployConfig(
			outputContainers(
				{
					name: "api",
					image: { reference: "registry.example/api:latest" },
					maxInstances: 1,
				},
				{
					name: "other-worker-container",
					image: { localReference: "other:local-build" },
					maxInstances: 1,
				}
			),
			config,
			{ accountId: "account-id" }
		);

		expect(result.source).toEqual([
			expect.objectContaining({ name: "api", class_name: "ContainerDO" }),
		]);
		expect(result.standard.normalized).toHaveLength(1);
		expect(result.standard.builtImages).toEqual([]);
	});

	it("rejects a Durable Object export with no matching Container output", () => {
		expect(() =>
			createContainerDeployConfig(
				outputContainers(),
				{
					...config,
					exports: durableObjectExports({ MissingDO: "missing" }),
				} as Config,
				{ accountId: "account-id" }
			)
		).toThrowError(
			new BuildOutputConfigError(
				'Container "missing" referenced by Durable Object export "MissingDO" must have exactly one Build Output config.'
			)
		);
	});

	it("rejects duplicate Container outputs for a Durable Object export", () => {
		const duplicate = {
			name: "api",
			image: { reference: "registry.example/api:latest" },
			maxInstances: 1,
		} satisfies ParsedOutputContainerConfig;

		expect(() =>
			createContainerDeployConfig(
				outputContainers(duplicate, duplicate),
				config,
				{ accountId: "account-id" }
			)
		).toThrowError(
			'Container "api" referenced by Durable Object export "ContainerDO" must have exactly one Build Output config.'
		);
	});

	it("rejects a Container referenced by multiple Durable Object exports", () => {
		expect(() =>
			createContainerDeployConfig(
				outputContainers({
					name: "api",
					image: { reference: "registry.example/api:latest" },
					maxInstances: 1,
				}),
				{
					...config,
					exports: durableObjectExports({ FirstDO: "api", SecondDO: "api" }),
				} as Config,
				{ accountId: "account-id" }
			)
		).toThrowError(
			'Container "api" is referenced by both Durable Object exports "FirstDO" and "SecondDO".'
		);
	});

	it("maps standard local images and rollout settings", () => {
		const containers = outputContainers({
			name: "api",
			image: { localReference: "api:local-build" },
			maxInstances: 4,
			instanceType: {
				vcpu: 1,
				memoryMib: 1024,
				diskMb: 4000,
			},
			rollout: { kind: "full-manual", stepPercentage: [50, 100] },
		});
		const result = createContainerDeployConfig(containers, config, {
			accountId: "account-id",
			containersRollout: "immediate",
		});
		const configured = createContainerDeployConfig(containers, config, {
			accountId: "account-id",
		});
		const gradual = createContainerDeployConfig(containers, config, {
			accountId: "account-id",
			containersRollout: "gradual",
		});

		expect(result.source).toEqual([
			expect.objectContaining({
				name: "api",
				class_name: "ContainerDO",
				image: "api:local-build",
			}),
		]);
		expect(result.standard.normalized[0]).toMatchObject({
			name: "api",
			class_name: "ContainerDO",
			dockerfile: "api:local-build",
			rollout_step_percentage: 100,
			rollout_kind: "full_auto",
			disk_bytes: 4_000_000_000,
		});
		expect(result.standard.builtImages[0]).toMatchObject({
			localTag: "api:local-build",
		});
		expect(result.standard.builtImages[0]?.container).toBe(
			result.standard.normalized[0]
		);
		for (const preserved of [configured, gradual]) {
			expect(preserved.standard.normalized[0]).toMatchObject({
				rollout_step_percentage: [50, 100],
				rollout_kind: "full_manual",
			});
		}
	});

	it("applies standard defaults and the no-rollout override", () => {
		const containers = outputContainers({
			name: "api",
			image: { reference: "registry.example/api:latest" },
			maxInstances: 20,
		});
		const gradual = createContainerDeployConfig(containers, config, {
			accountId: "account-id",
		});
		const skipped = createContainerDeployConfig(containers, config, {
			accountId: "account-id",
			containersRollout: "none",
		});

		expect(gradual.standard.normalized[0]).toMatchObject({
			instance_type: "lite",
			scheduling_policy: "default",
			rollout_step_percentage: [10, 100],
			rollout_kind: "full_auto",
			rollout_active_grace_period: 0,
			constraints: { tiers: [1, 2] },
		});
		expect(skipped.standard.normalized[0]?.rollout_kind).toBe("none");
	});

	it("preserves an explicit Container log disable", () => {
		const result = createContainerDeployConfig(
			outputContainers({
				name: "api",
				image: { reference: "registry.example/api:latest" },
				maxInstances: 1,
				observability: {
					enabled: true,
					logs: { enabled: false },
				},
			}),
			config,
			{ accountId: "account-id" }
		);

		expect(result.standard.normalized[0]?.observability).toEqual({
			logs_enabled: false,
		});
	});

	it("maps SSH settings for standard and Durable Object-managed Containers", () => {
		const ssh = { enabled: true, port: 2222 };
		const authorizedKeys = [{ name: "laptop", publicKey: "ssh-ed25519 AAAA" }];
		const result = createContainerDeployConfig(
			outputContainers(
				{
					name: "api",
					image: { reference: "registry.example/api:latest" },
					maxInstances: 1,
					ssh,
					authorizedKeys,
				},
				{
					name: "session",
					schedulingPolicy: "durable-object",
					ssh,
					authorizedKeys,
				}
			),
			{
				...config,
				exports: durableObjectExports({
					ContainerDO: "api",
					SessionDO: "session",
				}),
			} as Config,
			{ accountId: "account-id" }
		);
		const expected = {
			ssh,
			authorized_keys: [{ name: "laptop", public_key: "ssh-ed25519 AAAA" }],
		};

		expect(result.source).toEqual([
			expect.objectContaining({ name: "api", ...expected }),
			expect.objectContaining({
				name: "session",
				scheduling_policy: "durable_object",
				...expected,
			}),
		]);
	});

	it("maps Durable Object-managed registry and local images", () => {
		const result = createContainerDeployConfig(
			outputContainers({
				name: "session",
				schedulingPolicy: "durable-object",
				images: {
					base: { reference: "registry.example/base:tag" },
					app: { localReference: "session-app:local-build" },
				},
				observability: {
					enabled: true,
					logs: { enabled: false },
				},
			}),
			{
				...config,
				exports: durableObjectExports({ SessionDO: "session" }),
			} as Config,
			{ accountId: "account-id" }
		);

		expect(result.source).toEqual([
			expect.objectContaining({
				name: "session",
				class_name: "SessionDO",
				scheduling_policy: "durable_object",
				images: {
					base: { image: "registry.example/base:tag" },
					app: { dockerfile: "session-app:local-build" },
				},
				observability: {
					enabled: false,
					logs: { enabled: false },
				},
			}),
		]);
		expect(result.durableObjects.builtImages).toEqual([
			{
				className: "SessionDO",
				imageName: "app",
				localTag: "session-app:local-build",
			},
		]);
	});
});
