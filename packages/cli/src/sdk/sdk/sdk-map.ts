import sdkMapJson from './sdk-map.json' with { type: 'json' };

export interface SdkMapEntry {
  accessor: string[];
  method: string;
  httpMethod: string;
  path: string;
  requestType?: string;
  responseType?: string;
  requestBodyProperty?: string;
  requiredRequestProperties?: string[];
  numericRequestProperties?: string[];
  operationIdSource?: 'synthetic';
}

function isSdkMapEntry(value: unknown): value is SdkMapEntry {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return false;
  const get = (key: string): unknown => Reflect.get(value, key);
  const accessor = get('accessor');
  const requiredRequestProperties = get('requiredRequestProperties');
  const numericRequestProperties = get('numericRequestProperties');
  return (
    Array.isArray(accessor) &&
    accessor.every((part) => typeof part === 'string') &&
    typeof get('method') === 'string' &&
    typeof get('httpMethod') === 'string' &&
    typeof get('path') === 'string' &&
    (get('requestType') === undefined || typeof get('requestType') === 'string') &&
    (get('responseType') === undefined || typeof get('responseType') === 'string') &&
    (get('requestBodyProperty') === undefined || typeof get('requestBodyProperty') === 'string') &&
    (requiredRequestProperties === undefined ||
      (Array.isArray(requiredRequestProperties) &&
        requiredRequestProperties.every((part) => typeof part === 'string'))) &&
    (numericRequestProperties === undefined ||
      (Array.isArray(numericRequestProperties) &&
        numericRequestProperties.every((part) => typeof part === 'string'))) &&
    (get('operationIdSource') === undefined || get('operationIdSource') === 'synthetic')
  );
}

function parseSdkMap(value: unknown): Record<string, SdkMapEntry> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Invalid sdk-map.json: expected an object');
  }
  const entries = Object.entries(value);
  for (const [operationId, entry] of entries) {
    if (!isSdkMapEntry(entry)) {
      throw new TypeError(`Invalid sdk-map.json entry: ${operationId}`);
    }
  }
  return Object.fromEntries(entries);
}

const sdkMap = parseSdkMap(sdkMapJson);

export function getSdkMapEntry(operationId: string): SdkMapEntry | undefined {
  return sdkMap[operationId];
}
