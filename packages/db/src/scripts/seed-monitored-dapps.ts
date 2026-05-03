import { eq } from "drizzle-orm";
import { loadEnv } from "@arcana/shared/src/config";
import { createDb } from "../index";
import { dapps } from "../schema";

const MONITORED_DAPPS = [
  {
    name: "StylusPencil",
    contractAddresses: ["0xb9ff17bc84720734fd8b0c88b2905008a71091d0"],
    chainId: 42161,
  },
  {
    name: "Stylus Hello World",
    contractAddresses: ["0x6dc35eb6f074dcc2485394d4cc5c7429f70c7c5f"],
    chainId: 42161,
  },
  {
    name: "Keystone Lending",
    contractAddresses: ["0x4dff9348275ac3c24e2d3abf54af61d3ebee1585"],
    chainId: 42161,
  },
  {
    name: "Keystone AMM",
    contractAddresses: ["0x9615cc2f65d8bbe4cdc80343db75a6ec32da93cd"],
    chainId: 42161,
  },
  {
    name: "Keystone Vault",
    contractAddresses: ["0xdaf8f1a5f8025210f07665d4ccf2d2c0622a41fa"],
    chainId: 42161,
  },
  {
    name: "9Lives Prediction Market",
    contractAddresses: ["0x17769631bf02c6d1455f2cd46282242decd0cbb0f"],
    chainId: 42161,
  },
  {
    name: "Infinite Rainbows",
    contractAddresses: ["0x78072889ee4d7fe1a100c25296aabbea32e92bea"],
    chainId: 42161,
  },
] as const;

async function main() {
  const ifEmpty = process.argv.includes("--if-empty");
  const env = loadEnv();
  const { db, client } = createDb(env.DATABASE_URL);

  try {
    const existing = await db.select().from(dapps);
    const activeCount = existing.filter((dapp) => dapp.deletedAt === null).length;

    if (ifEmpty && activeCount > 0) {
      console.log(
        `[arcana:seed] Skipping monitored dApp seed because ${activeCount} active dApp(s) already exist`,
      );
      return;
    }

    let created = 0;
    let restored = 0;
    let updated = 0;
    let unchanged = 0;

    for (const monitored of MONITORED_DAPPS) {
      const normalizedAddresses = normalizeAddresses(monitored.contractAddresses);
      const matchingRecord = existing.find((dapp) =>
        dapp.contractAddresses.some((address) =>
          normalizedAddresses.includes(address.toLowerCase()),
        ),
      );

      if (!matchingRecord) {
        const [inserted] = await db
          .insert(dapps)
          .values({
            name: monitored.name,
            contractAddresses: normalizedAddresses,
            abi: null,
            chainId: monitored.chainId,
            deletedAt: null,
          })
          .returning();

        existing.push(inserted);
        created += 1;
        continue;
      }

      const currentAddresses = normalizeAddresses(matchingRecord.contractAddresses);
      const sameAddresses = arraysEqual(currentAddresses, normalizedAddresses);
      const needsRestore = matchingRecord.deletedAt !== null;
      const needsRename = matchingRecord.name !== monitored.name;
      const needsAddressUpdate = !sameAddresses;
      const needsChainUpdate = matchingRecord.chainId !== monitored.chainId;

      if (!needsRestore && !needsRename && !needsAddressUpdate && !needsChainUpdate) {
        unchanged += 1;
        continue;
      }

      const [nextRecord] = await db
        .update(dapps)
        .set({
          name: monitored.name,
          contractAddresses: normalizedAddresses,
          chainId: monitored.chainId,
          deletedAt: null,
        })
        .where(eq(dapps.id, matchingRecord.id))
        .returning();

      const index = existing.findIndex((dapp) => dapp.id === matchingRecord.id);
      if (index >= 0) {
        existing[index] = nextRecord;
      }

      if (needsRestore) {
        restored += 1;
      }
      if (needsRename || needsAddressUpdate || needsChainUpdate) {
        updated += 1;
      }
    }

    console.log(
      `[arcana:seed] Monitored dApp seed complete: created=${created}, restored=${restored}, updated=${updated}, unchanged=${unchanged}`,
    );
  } finally {
    await client.end();
  }
}

function normalizeAddresses(addresses: readonly string[]) {
  return [...new Set(addresses.map((address) => address.toLowerCase()))].sort();
}

function arraysEqual(left: readonly string[], right: readonly string[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

main().catch((error) => {
  console.error("[arcana:seed] Failed to seed monitored dApps:", error);
  process.exit(1);
});
