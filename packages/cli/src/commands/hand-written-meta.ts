/**
 * The `meta.ts` sidecar of every command in `hand-written.ts`, by kind and
 * directory. The generator plugin bundles it to splice the commands'
 * metadata into the generated `_meta/`; the CLI itself reads that, not this.
 *
 * Like the registry, it and every sidecar must import nothing but types.
 * The types require exactly one sidecar per registered command.
 */
import accessCurlMeta from "./access/curl/meta.js";
import accessLoginMeta from "./access/login/meta.js";
import accessSshConfigMeta from "./access/ssh-config/meta.js";
import accessSshGenMeta from "./access/ssh-gen/meta.js";
import accessTcpMeta from "./access/tcp/meta.js";
import accessTokenMeta from "./access/token/meta.js";
import aiRunMeta from "./ai/run/meta.js";
import authMeta from "./auth/meta.js";
import buildMeta from "./build/meta.js";
import cliMeta from "./cli/meta.js";
import completionsMeta from "./completions/meta.js";
import containersBuildMeta from "./containers/build/meta.js";
import containersImagesDeleteMeta from "./containers/images/delete/meta.js";
import containersImagesListMeta from "./containers/images/list/meta.js";
import containersPushMeta from "./containers/push/meta.js";
import containersSshMeta from "./containers/ssh/meta.js";
import d1MigrationsMeta from "./d1/migrations/meta.js";
import deployMeta from "./deploy/meta.js";
import devMeta from "./dev/meta.js";
import docsMeta from "./docs/meta.js";
import initMeta from "./init/meta.js";
import loginMeta from "./login/meta.js";
import migrateMeta from "./migrate/meta.js";
import pagesDeployMeta from "./pages/deploy/meta.js";
import previewsDeployMeta from "./previews/deploy/meta.js";
import registrarRegistrationsCreateMeta from "./registrar/registrations/create/meta.js";
import schemaMeta from "./schema/meta.js";
import toolsMeta from "./tools/meta.js";
import tunnelsDiagMeta from "./tunnels/diag/meta.js";
import tunnelsLoginMeta from "./tunnels/login/meta.js";
import tunnelsQuickStartMeta from "./tunnels/quick-start/meta.js";
import tunnelsReadyMeta from "./tunnels/ready/meta.js";
import tunnelsRunMeta from "./tunnels/run/meta.js";
import tunnelsTailMeta from "./tunnels/tail/meta.js";
import workersCheckMeta from "./workers/check/meta.js";
import workersTriggersMeta from "./workers/triggers/meta.js";
import workersTypesMeta from "./workers/types/meta.js";
import workersVersionsCreateMeta from "./workers/versions/create/meta.js";
import type {
	CommandMeta,
	LeafCommandMeta,
	LeafOverrideMeta,
} from "../lib/command-meta.js";
import type { HandWrittenDir } from "./hand-written.js";

export const handWrittenMeta = {
	roots: {
		auth: authMeta,
		login: loginMeta,
		build: buildMeta,
		completions: completionsMeta,
		deploy: deployMeta,
		dev: devMeta,
		docs: docsMeta,
		init: initMeta,
		migrate: migrateMeta,
		cli: cliMeta,
		schema: schemaMeta,
		tools: toolsMeta,
	},
	subgroups: {
		"d1/migrations": d1MigrationsMeta,
		"workers/triggers": workersTriggersMeta,
	},
	leaves: {
		"workers/versions/create": workersVersionsCreateMeta,
		"containers/build": containersBuildMeta,
		"containers/push": containersPushMeta,
		"containers/images/list": containersImagesListMeta,
		"containers/images/delete": containersImagesDeleteMeta,
		"containers/ssh": containersSshMeta,
		"pages/deploy": pagesDeployMeta,
		"previews/deploy": previewsDeployMeta,
		"workers/check": workersCheckMeta,
		"workers/types": workersTypesMeta,
		"access/login": accessLoginMeta,
		"access/token": accessTokenMeta,
		"access/ssh-config": accessSshConfigMeta,
		"access/ssh-gen": accessSshGenMeta,
		"access/tcp": accessTcpMeta,
		"access/curl": accessCurlMeta,
		"tunnels/diag": tunnelsDiagMeta,
		"tunnels/login": tunnelsLoginMeta,
		"tunnels/quick-start": tunnelsQuickStartMeta,
		"tunnels/ready": tunnelsReadyMeta,
		"tunnels/run": tunnelsRunMeta,
		"tunnels/tail": tunnelsTailMeta,
	},
	leafOverrides: {
		"ai/run": aiRunMeta,
		"registrar/registrations/create": registrarRegistrationsCreateMeta,
	},
} satisfies {
	roots: Record<HandWrittenDir<"root">, readonly CommandMeta[]>;
	subgroups: Record<HandWrittenDir<"subgroup">, readonly CommandMeta[]>;
	leaves: Record<HandWrittenDir<"leaf">, LeafCommandMeta>;
	leafOverrides: Record<HandWrittenDir<"leafOverride">, LeafOverrideMeta>;
};
