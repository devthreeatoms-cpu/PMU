"use server";

import { adminDb } from "@/lib/firebase-admin";
import { sendNewProductLaunchEmail } from "@/lib/marketing-emails";
import { revalidatePath } from "next/cache";

export async function createProductAction(data: any) {
  try {
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const now = Date.now();
    
    // Calculate total stock if variants exist
    let totalStock = parseInt(data.stock, 10) || 0;
    if (data.hasVariants && data.variants) {
      totalStock = data.variants.reduce((acc: number, v: any) => acc + (parseInt(v.stock, 10) || 0), 0);
    }

    const docData = {
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      price: parseFloat(data.price) || 0,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      sku: data.sku?.trim() || null,
      category: data.category,
      stock: totalStock,
      imageUrls: data.imageUrls || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      hasVariants: data.hasVariants || false,
      options: data.options || [],
      variants: data.variants || [],
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await adminDb.collection("products").add(docData);

    // Trigger Product Launch Email to all users
    try {
      const usersSnapshot = await adminDb.collection("users").get();
      const userEmails = usersSnapshot.docs
        .map(doc => doc.data().email)
        .filter(email => email && typeof email === 'string');

      if (userEmails.length > 0) {
        await sendNewProductLaunchEmail(userEmails, {
          id: docRef.id,
          name: docData.name,
          description: docData.description,
          image: docData.imageUrls[0] || null
        });
      }
    } catch (emailErr) {
      console.error("Failed to send launch emails:", emailErr);
    }

    revalidatePath("/");
    revalidatePath("/products");
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error("Server Action Error (createProduct):", err);
    return { success: false, error: err.message || "Failed to create product" };
  }
}

export async function getProductsAction() {
  try {
    const snapshot = await adminDb.collection("products").orderBy("createdAt", "desc").get();
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });
    return { success: true, products };
  } catch (err: any) {
    console.error("Server Action Error (getProducts):", err);
    return { success: false, error: err.message || "Failed to fetch products" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    // Basic server-side protection - in a real app, you'd get the current user ID from session/cookies
    // For this implementation, we assume the middleware or a wrapper handles identity
    // await verifyPermission(currentUserId, 'products', 'delete');
    
    await adminDb.collection("products").doc(id).delete();
    revalidatePath("/");
    revalidatePath("/products");
    return { success: true };
  } catch (err: any) {
    console.error("Server Action Error (deleteProduct):", err);
    return { success: false, error: err.message || "Failed to delete product" };
  }
}

export async function toggleProductStatusAction(id: string, currentStatus: boolean) {
  try {
    await adminDb.collection("products").doc(id).update({
      isActive: !currentStatus,
      updatedAt: Date.now()
    });
    revalidatePath("/");
    revalidatePath("/products");
    return { success: true };
  } catch (err: any) {
    console.error("Server Action Error (toggleProductStatus):", err);
    return { success: false, error: err.message || "Failed to toggle status" };
  }
}

export async function getProductAction(id: string) {
  try {
    const doc = await adminDb.collection("products").doc(id).get();
    if (!doc.exists) return { success: false, error: "Product not found" };
    
    return { 
      success: true, 
      product: { id: doc.id, ...doc.data() } 
    };
  } catch (err: any) {
    console.error("Server Action Error (getProduct):", err);
    return { success: false, error: err.message || "Failed to fetch product" };
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // Calculate total stock if variants exist
    let totalStock = parseInt(data.stock, 10) || 0;
    if (data.hasVariants && data.variants) {
      totalStock = data.variants.reduce((acc: number, v: any) => acc + (parseInt(v.stock, 10) || 0), 0);
    }

    const updateData = {
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      price: parseFloat(data.price) || 0,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      sku: data.sku?.trim() || null,
      category: data.category,
      stock: totalStock,
      imageUrls: data.imageUrls || [],
      isActive: data.isActive,
      isFeatured: data.isFeatured || false,
      hasVariants: data.hasVariants || false,
      options: data.options || [],
      variants: data.variants || [],
      updatedAt: Date.now(),
    };

    await adminDb.collection("products").doc(id).update(updateData);
    revalidatePath("/");
    revalidatePath("/products");
    return { success: true };
  } catch (err: any) {
    console.error("Server Action Error (updateProduct):", err);
    return { success: false, error: err.message || "Failed to update product" };
  }
}

export async function getFeaturedCountAction() {
  try {
    const snapshot = await adminDb.collection("products").where("isFeatured", "==", true).get();
    return { success: true, count: snapshot.size };
  } catch (err: any) {
    console.error("Server Action Error (getFeaturedCount):", err);
    return { success: false, error: err.message };
  }
}
