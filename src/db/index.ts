import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getServerEnv } from "@/lib/env.server";
import * as relations from "./relations";
import * as schema from "./schema";

const serverEnv = getServerEnv();
const sql = neon(serverEnv.DATABASE_URL || "postgresql://user:password@localhost:5432/usted_findit");

export const db = drizzle(sql, {
  schema: {
    ...schema,
    ...relations
  }
});

export { sql };
