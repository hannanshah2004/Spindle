import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Params {
  projectId: string;
}

export async function GET({ params }: { params: Params }) {
  try {
    const { userId } = await auth();
    const { projectId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Ensure the user owns the project
    if (project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(project);

  } catch (error) {
    console.error(`Error fetching project ${params.projectId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE({ params }: { params: Params }) {
  try {
    const { userId } = await auth();
    const { projectId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 1. Verify Project Ownership (important before deleting)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true }, // Only need userId for verification
    });

    if (!project) {
      // Project already gone or never existed, return success (idempotent)
      return new NextResponse(null, { status: 204 });
    }

    if (project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Delete the project (cascades to sessions)
    await prisma.project.delete({
      where: { id: projectId },
    });

    // 3. Return Success
    return new NextResponse(null, { status: 204 }); // No content on successful delete

  } catch (error) {
    // Handle potential errors, e.g., if the project is referenced elsewhere unexpectedly
    console.error(`Error deleting project ${params.projectId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 