import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

interface CreateProjectBody {
  name: string;
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const body: CreateProjectBody = await request.json();
    const { name } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: {
        name: name,
        userId: userId,
      },
    });

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 