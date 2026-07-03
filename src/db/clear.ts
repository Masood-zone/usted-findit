import { db } from "@/db";
import { adminLogs, claims, itemImages, items, notifications, profileUpdateRequests, savedItems } from "@/db/schema";
import { count } from "drizzle-orm";

async function main() {
  await db.delete(adminLogs);
  await db.delete(notifications);
  await db.delete(savedItems);
  await db.delete(claims);
  await db.delete(itemImages);
  await db.delete(items);
  await db.delete(profileUpdateRequests);

  console.log("Cleared operational data without seeding new records.");

  const checks = [
    ["adminLogs", adminLogs],
    ["notifications", notifications],
    ["savedItems", savedItems],
    ["claims", claims],
    ["itemImages", itemImages],
    ["items", items],
    ["profileUpdateRequests", profileUpdateRequests]
  ] as const;

  for (const [name, table] of checks) {
    const rows = await db.select({ value: count() }).from(table);
    console.log(`${name}: ${rows[0]?.value ?? 0}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
