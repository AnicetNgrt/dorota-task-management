import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskCategory } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const category = searchParams.get("category") as TaskCategory | null;
  const important = searchParams.get("important");
  const completedAfter = searchParams.get("completedAfter");
  const completedBefore = searchParams.get("completedBefore");

  const where: Record<string, unknown> = { userId: user.id };

  if (date) {
    where.assignedDay = new Date(date);
  }

  if (category) {
    where.category = category;
  }

  if (important === "true") {
    where.isImportant = true;
  }

  if (completedAfter || completedBefore) {
    where.isCompleted = true;
    const completedAt: Record<string, Date> = {};
    if (completedAfter) completedAt.gte = new Date(completedAfter);
    if (completedBefore) completedAt.lte = new Date(completedBefore);
    where.completedAt = completedAt;
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, category, assignedDay, isImportant } = await req.json();

  if (!title || !category || !assignedDay) {
    return NextResponse.json(
      { error: "title, category, and assignedDay are required" },
      { status: 400 }
    );
  }

  const maxPos = await prisma.task.aggregate({
    where: { userId: user.id, assignedDay: new Date(assignedDay), category },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      title,
      category,
      assignedDay: new Date(assignedDay),
      isImportant: isImportant || false,
      position: (maxPos._max.position ?? -1) + 1,
      userId: user.id,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, category, isImportant, isCompleted, assignedDay } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.task.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (isImportant !== undefined) data.isImportant = isImportant;
  if (assignedDay !== undefined) data.assignedDay = new Date(assignedDay);

  if (category !== undefined) {
    data.category = category;
    if (category === "DONE" && !existing.isCompleted) {
      data.isCompleted = true;
      data.completedAt = new Date(existing.assignedDay);
    } else if (category !== "DONE" && existing.isCompleted) {
      data.isCompleted = false;
      data.completedAt = null;
    }
  }

  if (isCompleted !== undefined) {
    data.isCompleted = isCompleted;
    if (isCompleted && !existing.isCompleted) {
      data.completedAt = new Date(existing.assignedDay);
      if (existing.category !== "DONE" && existing.category !== "GENERAL") {
        data.category = "DONE";
      }
    } else if (!isCompleted) {
      data.completedAt = null;
    }
  }

  const task = await prisma.task.update({ where: { id }, data });
  return NextResponse.json({ task });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.task.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
