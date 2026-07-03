import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { profileUpdateRequests } from "@/db/schema";
import { errorResponse, internalServerErrorResponse, successResponse } from "@/lib/api-response";
import { guardErrorResponse, requireUser } from "@/lib/auth-guards.server";

const profileUpdateRequestSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().max(30).optional().nullable()
});

function requestId() {
  return `profile_req_${crypto.randomUUID()}`;
}

export async function GET(request: Request) {
  try {
    const context = await requireUser(request);
    const rows = await db
      .select()
      .from(profileUpdateRequests)
      .where(eq(profileUpdateRequests.userId, context.user.id))
      .orderBy(desc(profileUpdateRequests.createdAt))
      .limit(10);

    return successResponse({
      requests: rows.map((row) => ({
        adminNotes: row.adminNotes,
        createdAt: row.createdAt.toISOString(),
        id: row.id,
        requestedEmail: row.requestedEmail,
        requestedName: row.requestedName,
        requestedPhone: row.requestedPhone,
        status: row.status
      }))
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}

export async function POST(request: Request) {
  try {
    const context = await requireUser(request);
    const body = await request.json().catch(() => null);
    const parsed = profileUpdateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("INVALID_PROFILE_UPDATE", "Enter a valid name, phone number, and email address.");
    }

    const value = parsed.data;
    const inserted = await db
      .insert(profileUpdateRequests)
      .values({
        id: requestId(),
        requestedEmail: value.email.trim(),
        requestedName: value.name.trim(),
        requestedPhone: value.phone?.trim() || null,
        status: "PENDING",
        userId: context.user.id
      })
      .returning();

    const row = inserted[0];

    return successResponse({
      request: {
        adminNotes: row.adminNotes,
        createdAt: row.createdAt.toISOString(),
        id: row.id,
        requestedEmail: row.requestedEmail,
        requestedName: row.requestedName,
        requestedPhone: row.requestedPhone,
        status: row.status
      }
    });
  } catch (error) {
    try {
      return guardErrorResponse(error);
    } catch {
      return internalServerErrorResponse();
    }
  }
}
