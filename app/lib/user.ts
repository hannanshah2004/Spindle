import { currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Gets the current Clerk user and ensures a corresponding record exists in our database.
 * Creates the User record if it doesn't exist.
 * @returns The user from our database, or null if not authenticated
 */
export async function getOrCreateUser() {
  // Get the current Clerk user
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null; // Not authenticated
  }
  
  // Check if we already have this user in our database
  let user = await prisma.user.findUnique({
    where: {
      id: clerkUser.id,
    },
  });
  
  // If not, create the user
  if (!user) {
    const primaryEmail = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    );
    
    if (!primaryEmail?.emailAddress) {
      console.error("User has no primary email address");
      throw new Error("User email not available");
    }
    
    user = await prisma.user.create({
      data: {
        id: clerkUser.id,
        email: primaryEmail.emailAddress,
      },
    });
    
    console.log(`Created new user record for ${user.email}`);
  }
  
  return user;
} 