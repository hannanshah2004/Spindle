import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOrCreateUser } from '@/app/lib/user';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get the user from our database
    const user = await getOrCreateUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    const projectsWithSessionCount = projects.map(project => ({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        userId: project.userId,
        sessionCount: project._count.sessions,
    }));

    return NextResponse.json(projectsWithSessionCount);

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
    const user = await getOrCreateUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body: CreateProjectBody = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: {
        name: name,
        userId: user.id,
      },
    });

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 