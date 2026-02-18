import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, targetCategory, targetDay, newPosition } = await req.json();

  if (!taskId || newPosition === undefined) {
    return NextResponse.json(
      { error: "taskId and newPosition are required" },
      { status: 400 }
    );
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = { position: newPosition };

  if (targetCategory) {
    data.category = targetCategory;
    if (targetCategory === "DONE" && !task.isCompleted) {
      data.isCompleted = true;
      data.completedAt = new Date(task.assignedDay);
    } else if (targetCategory !== "DONE" && task.isCompleted && task.category === "DONE") {
      data.isCompleted = false;
      data.completedAt = null;
    }
  }

  if (targetDay) {
    data.assignedDay = new Date(targetDay);
  }

  const updated = await prisma.task.update({ where: { id: taskId }, data });
  return NextResponse.json({ task: updated });
}
