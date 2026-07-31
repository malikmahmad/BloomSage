import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required."),
  description: z.string().trim().optional().default(""),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  description: z.string().trim().optional().default(""),
  price: z.coerce.number().positive("Price must be greater than 0."),
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  categoryId: z.coerce.number().int().nullable().optional(),
  imageUrl: z.string().trim().optional().default(""),
  stock: z.coerce.number().int().min(0, "Stock can't be negative."),
  sku: z.string().trim().optional().nullable(),
  isFeatured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
      })
    )
    .min(1, "Your cart is empty."),
  shipping: z.object({
    fullName: z.string().trim().min(2, "Full name is required."),
    phone: z.string().trim().min(6, "Enter a valid phone number."),
    address: z.string().trim().min(5, "Street address is required."),
    city: z.string().trim().min(2, "City is required."),
    postalCode: z.string().trim().optional().default(""),
  }),
  paymentMethod: z.enum(["cod", "card"]).default("cod"),
  notes: z.string().trim().optional().default(""),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

// Parse and validate against a Zod schema — throws a badRequest ApiError
// with field-level details if validation fails, so callers don't have to
// repeat the same error-handling boilerplate in every route
export function parseOrThrow(schema, data, badRequest) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw badRequest("Please check the highlighted fields.", details);
  }
  return result.data;
}
