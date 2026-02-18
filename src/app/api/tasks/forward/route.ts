import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Forward all incomplete TODO and IN_PROGRESS tasks from past days to today
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.task.updateMany({
    where: {
      userId: user.id,
      category: { in: ["TODO", "IN_PROGRESS"] },
      assignedDay: { lt: today },
      isCompleted: false,
    },
    data: {
      assignedDay: today,
    },
  });

  return NextResponse.json({ forwarded: result.count });
}
