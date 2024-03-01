const JSR_REGISTRY_URL = "http://jsr.io/";
const NPM_REGISTRY_URL = "http://npm.jsr.io/";

interface VersionMetadata {
  yanked?: boolean;
}

interface Versions {
  [version: string]: VersionMetadata;
}

interface PackageMeta {
  name: string;
  scope: string;
  versions: Versions;
}

// This is probably fine, Yarn installs are short-lived anyway
function leakyCached<Args extends string[], T>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<T> {
  const cache = new Map<string, Promise<T>>();
  return (...args: Args) => {
    const key = args.join(",");
    if (cache.has(key)) return cache.get(key);
    const promise = fn(...args);
    cache.set(key, promise);
    promise.catch(() => cache.delete(key));
    return promise;
  };
}

const getPackageMetadata = leakyCached(async function getPackageMetadata(
  scope: string,
  name: string
): Promise<PackageMeta> {
  const response = await fetch(
    `${JSR_REGISTRY_URL}/@${scope}/${name}/meta.json`
  );
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`${name} does not exist on from JSR`);
    }
    throw new Error(`Failed to fetch ${name} metadata from JSR`);
  }
  return (await response.json()) as PackageMeta;
});

export async function getVersions(
  scope: string,
  name: string
): Promise<{ valid: string[]; yanked: string[] }> {
  const valid = [];
  const yanked = [];

  const meta = await getPackageMetadata(scope, name);
  for (const [version, desc] of Object.entries(meta.versions)) {
    (desc.yanked ? yanked : valid).push(version);
  }

  if (name === "http") debugger;

  return { valid, yanked };
}

export const getNpmMetadata = leakyCached(async function getNpmMetadata(
  scope: string,
  name: string
) {
  const response = await fetch(`${NPM_REGISTRY_URL}/@jsr/${scope}__${name}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${name} npm metadata from JSR`);
  }
  return (await response.json()) as object;
});
