import type { PackageManager } from "./workers.js";

// Plugins import vite/vitest directly. Share Vite+'s core and bundled Vitest
// to avoid duplicate Vite instances and split test runner state.
// https://viteplus.dev/guide/local-cli#manual-installation
export const WORKER_TEMPLATE_DEV_DEPENDENCIES = {
	"@cloudflare/vite-plugin": "beta",
	"@cloudflare/vitest-plugin": "^1.5.0",
	typescript: "^7.0.2",
	vite: "npm:@voidzero-dev/vite-plus-core@1.4.0",
	"vite-plus": "1.4.0",
	vitest: "5.0.5",
} as const;

export interface WorkerTemplateOptions {
	name: string;
	compatibilityDate: string;
	cfVersion: string;
	packageManager: PackageManager;
}

export function renderWorkerTemplate(
	options: WorkerTemplateOptions
): Record<string, string> {
	return {
		".gitignore": renderGitignore(),
		"cloudflare.config.ts": renderCloudflareConfig(options),
		"package.json": renderPackageJson(options),
		...(options.packageManager === "pnpm"
			? { "pnpm-workspace.yaml": renderPnpmWorkspace() }
			: {}),
		...(options.packageManager === "yarn"
			? { ".yarnrc.yml": "nodeLinker: node-modules\n" }
			: {}),
		"src/index.ts": renderEntrypoint(),
		"test/index.test.ts": renderTest(),
		"tsconfig.json": renderTsconfig(),
		"vite.config.ts": renderViteConfig(),
		"vitest.config.ts": renderVitestConfig(),
	};
}

function renderPnpmWorkspace(): string {
	return `packages:
  - "."

# Share Vite+'s core and Vitest with plugins to avoid duplicate runtimes.
overrides:
  vite: ${JSON.stringify(WORKER_TEMPLATE_DEV_DEPENDENCIES.vite)}
  vitest: ${JSON.stringify(WORKER_TEMPLATE_DEV_DEPENDENCIES.vitest)}

# Approve build scripts needed by the generated Worker's dependencies.
allowBuilds:
  esbuild: true
  workerd: true
`;
}

export function cfDependencyRange(version: string): string {
	return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)
		? `^${version}`
		: "latest";
}

function renderCloudflareConfig(options: WorkerTemplateOptions): string {
	return `import { bindings, defineConfig } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

export default defineConfig({
	worker: {
		name: ${JSON.stringify(options.name)},
		compatibilityDate: ${JSON.stringify(options.compatibilityDate)},
		entrypoint,
		env: {
			WORLD: bindings.text("World"),
		},
	},
});
`;
}

function renderViteConfig(): string {
	return `import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
	plugins: [cloudflare()],
	fmt: { useTabs: true },
	lint: {
		options: { typeAware: true, typeCheck: true },
	},
});
`;
}

function renderVitestConfig(): string {
	return `import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vite-plus";

export default defineConfig({
	plugins: [cloudflareTest({ config: true })],
});
`;
}

function renderTest(): string {
	return `import { SELF } from "cloudflare:test";
import { expect, it } from "vite-plus/test";

it("responds using the configured Worker binding", async () => {
	const response = await SELF.fetch("https://example.com/");
	expect(response.status).toBe(200);
	expect(await response.text()).toBe("Hello World!");
});
`;
}

function renderEntrypoint(): string {
	return `import { env } from "cloudflare:workers";

export default {
	fetch() {
		return new Response(\`Hello \${env.WORLD}!\`);
	},
} satisfies ExportedHandler;
`;
}

function renderPackageJson(options: WorkerTemplateOptions): string {
	const packageJson = {
		name: options.name,
		private: true,
		type: "module",
		scripts: {
			dev: "cf dev",
			build: "cf build",
			deploy: "cf deploy",
			check: "cf workers types && vp check",
			format: "vp fmt",
			test: "vp test",
			typecheck: "cf workers types && vp check --no-fmt --no-lint",
		},
		devDependencies: {
			"@cloudflare/vite-plugin":
				WORKER_TEMPLATE_DEV_DEPENDENCIES["@cloudflare/vite-plugin"],
			"@cloudflare/vitest-plugin":
				WORKER_TEMPLATE_DEV_DEPENDENCIES["@cloudflare/vitest-plugin"],
			cf: cfDependencyRange(options.cfVersion),
			typescript: WORKER_TEMPLATE_DEV_DEPENDENCIES.typescript,
			vite: WORKER_TEMPLATE_DEV_DEPENDENCIES.vite,
			"vite-plus": WORKER_TEMPLATE_DEV_DEPENDENCIES["vite-plus"],
			vitest: WORKER_TEMPLATE_DEV_DEPENDENCIES.vitest,
		},
		...(options.packageManager === "pnpm"
			? {}
			: {
					[options.packageManager === "yarn" ? "resolutions" : "overrides"]: {
						vite: WORKER_TEMPLATE_DEV_DEPENDENCIES.vite,
						vitest: WORKER_TEMPLATE_DEV_DEPENDENCIES.vitest,
					},
				}),
		engines: { node: "^22.23.0 || ^24.22.0 || ^26.12.0" },
	};
	return `${JSON.stringify(packageJson, null, "\t")}\n`;
}

function renderTsconfig(): string {
	const tsconfig = {
		compilerOptions: {
			target: "es2024",
			lib: ["es2024"],
			module: "preserve",
			moduleResolution: "bundler",
			types: ["@cloudflare/vitest-plugin/types"],
			strict: true,
			noEmit: true,
			allowImportingTsExtensions: true,
			isolatedModules: true,
			verbatimModuleSyntax: true,
			skipLibCheck: true,
		},
		include: ["src", "test", "cloudflare.config.ts", ".cloudflare/types"],
	};
	// Keep string arrays compact so the new project passes `vp check`.
	const json = JSON.stringify(tsconfig, null, "\t").replace(
		/\[\n(?:\s*"(?:[^"\\]|\\.)*",?\n)+\s*\]/g,
		(array) => {
			const values = JSON.parse(array) as string[];
			return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
		}
	);
	return `${json}\n`;
}

function renderGitignore(): string {
	return `node_modules/
dist/
.cloudflare/
.wrangler/
.dev.vars*
!.dev.vars.example
.env*
!.env.example
*.log
.DS_Store
`;
}
