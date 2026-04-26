"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const propertySchema = z.object({
  name: z.string().min(3),
  address: z.string().min(5),
  city: z.string().min(3),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function createProperty(formData: FormData) {
  const session = await auth();

  if (!session || !session.user || !session.user.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  const validatedFields = propertySchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields.");
  }

  const { name, address, city, imageUrl } = validatedFields.data;

  try {
    await prisma.property.create({
      data: {
        name,
        address,
        city,
        imageUrl: imageUrl || null,
        ownerId: session.user.id,
      },
    });
  } catch (error) {
    throw new Error("Failed to create property.");
  }

  revalidatePath("/admin/properties");
}

export async function updateProperty(id: string, formData: FormData) {
  const session = await auth();

  if (!session || !session.user || !session.user.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  const validatedFields = propertySchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!validatedFields.success) {
    throw new Error("Invalid fields.");
  }

  const { name, address, city, imageUrl } = validatedFields.data;

  try {
    await prisma.property.update({
      where: { id },
      data: {
        name,
        address,
        city,
        imageUrl: imageUrl || null,
      },
    });
  } catch (error) {
    throw new Error("Failed to update property.");
  }

  revalidatePath("/admin/properties");
}

export async function deleteProperty(id: string) {
  const session = await auth();

  if (!session || !session.user || !session.user.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  try {
    await prisma.property.delete({
      where: { id },
    });
  } catch (error) {
    throw new Error("Failed to delete property.");
  }

  revalidatePath("/admin/properties");
}
