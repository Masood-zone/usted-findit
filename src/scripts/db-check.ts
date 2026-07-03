import { sql } from "@/db";

async function main() {
  await sql`select 1`;
  console.log("Database connection OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
