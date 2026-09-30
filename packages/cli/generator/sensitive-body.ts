import type { OperationInfo } from "@cloudflare/forge";

export function sensitiveBodyPaths(
	opInfo: OperationInfo
): readonly (readonly string[])[] {
	return (opInfo.bodyParams ?? [])
		.filter((param) => param.sensitive === true)
		.map((param) => param.apiFieldPath);
}
