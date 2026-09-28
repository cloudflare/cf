import {
	bindings,
	defineConfig,
	defineContainer,
	exports as configExports,
} from "cf/config";
import * as entrypoint from "./src/worker" with { type: "cf-worker" };

const workerName = "cf-vite-container-fixture";

const fixtureContainer = defineContainer({
	name: "cf-vite-container-fixture-app",
	image: {
		dockerfile: "./Dockerfile",
	},
	instanceType: "lite",
	maxInstances: 1,
});

export default defineConfig({
	worker: {
		name: workerName,
		entrypoint,
		compatibilityDate: "2026-09-12",
		exports: {
			ContainerDO: configExports.durableObject({
				storage: "sqlite",
				container: fixtureContainer,
			}),
		},
		env: {
			CONTAINER: bindings.durableObject({
				worker: workerName,
				exportName: "ContainerDO",
			}),
		},
		observability: { enabled: true },
	},
	containers: [fixtureContainer],
});
