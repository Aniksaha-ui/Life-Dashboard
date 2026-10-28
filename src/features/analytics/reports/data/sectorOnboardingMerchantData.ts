export type SectorOnboardingMerchantPoolEntry = {
  name: string;
  kamName: string;
};

const SECTOR_ONBOARDING_KAM_NAMES = [
  "Anik Kam",
  "Nahid",
  "saifur",
  "Shahriar",
  "susanta.kam",
  "susanta.tech",
  "Tahsin",
];

const SECTOR_ONBOARDING_MERCHANT_NAMES = [
  "Netro Model School & College",
  "Netro Model School & College",
  "Netro Model School & College",
  "Netro Model School & College",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic ss",
  "WELCOME ELECTRONICS",
  "Welcome Electronics",
  "WELCOME ELECTRONICS",
  "Meem Water Technology",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
  "Welcome Electronic",
];

export const SECTOR_ONBOARDING_MERCHANT_POOL: SectorOnboardingMerchantPoolEntry[] =
  SECTOR_ONBOARDING_MERCHANT_NAMES.map((name, index) => ({
    name,
    kamName:
      SECTOR_ONBOARDING_KAM_NAMES[index % SECTOR_ONBOARDING_KAM_NAMES.length],
  }));

export function normalizeSectorOnboardingMerchantPool(
  pool: unknown,
): SectorOnboardingMerchantPoolEntry[] {
  if (!Array.isArray(pool) || pool.length === 0) {
    return SECTOR_ONBOARDING_MERCHANT_POOL;
  }

  return pool.map((entry, index) => {
    if (typeof entry === "string") {
      return {
        name: entry,
        kamName:
          SECTOR_ONBOARDING_KAM_NAMES[
            index % SECTOR_ONBOARDING_KAM_NAMES.length
          ],
      };
    }

    if (entry && typeof entry === "object" && "name" in entry) {
      const record = entry as SectorOnboardingMerchantPoolEntry;
      return {
        name: record.name,
        kamName:
          record.kamName ||
          SECTOR_ONBOARDING_KAM_NAMES[
            index % SECTOR_ONBOARDING_KAM_NAMES.length
          ],
      };
    }

    return SECTOR_ONBOARDING_MERCHANT_POOL[
      index % SECTOR_ONBOARDING_MERCHANT_POOL.length
    ];
  });
}

export function resolveSectorOnboardingMerchants(
  count: number,
  pool: SectorOnboardingMerchantPoolEntry[] = SECTOR_ONBOARDING_MERCHANT_POOL,
): SectorOnboardingMerchantPoolEntry[] {
  if (count <= 0) return [];

  const source =
    pool.length > 0
      ? normalizeSectorOnboardingMerchantPool(pool)
      : SECTOR_ONBOARDING_MERCHANT_POOL;

  if (count <= source.length) {
    return source.slice(0, count);
  }

  return Array.from(
    { length: count },
    (_, index) => source[index % source.length],
  );
}
