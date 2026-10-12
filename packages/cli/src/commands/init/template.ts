import type { PackageManager } from "./workers.js";

export const WORKER_TEMPLATE_DEV_DEPENDENCIES = {
	"@cloudflare/vite-plugin": "beta",
	typescript: "^7.0.2",
	vite: "^8.3.0",
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
		"src/index.ts": renderEntrypoint(),
		"tsconfig.json": renderTsconfig(),
		"vite.config.ts": renderViteConfig(),
	};
}

function renderPnpmWorkspace(): string {
	return `# Approve build scripts needed by the generated Worker's dependencies.
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
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [cloudflare()],
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
			typecheck: "cf workers types && tsc",
		},
		devDependencies: {
			"@cloudflare/vite-plugin":
				WORKER_TEMPLATE_DEV_DEPENDENCIES["@cloudflare/vite-plugin"],
			cf: cfDependencyRange(options.cfVersion),
			typescript: WORKER_TEMPLATE_DEV_DEPENDENCIES.typescript,
			vite: WORKER_TEMPLATE_DEV_DEPENDENCIES.vite,
		},
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
			types: [],
			strict: true,
			noEmit: true,
			allowImportingTsExtensions: true,
			isolatedModules: true,
			verbatimModuleSyntax: true,
			skipLibCheck: true,
		},
		include: ["src", "cloudflare.config.ts", ".cloudflare/types"],
	};
	return `${JSON.stringify(tsconfig, null, "\t")}\n`;
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
