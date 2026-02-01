import { z } from "zod";

import {
  addressSchema,
  cityStateSchema,
  emailSchema,
  nameSchema,
  phoneSchema,
  uuidSchema,
} from "./common";

/**
 * SIWES details and placement organization schemas
 */

// Create or update SIWES details
export const siwesDetailSchema = z
  .object({
    placementOrganizationId: uuidSchema.optional(),
    organizationName: z.string().min(2).max(255).optional(),
    organizationAddress: addressSchema,
    organizationCity: cityStateSchema,
    organizationState: cityStateSchema,
    organizationPhone: phoneSchema,
    organizationEmail: emailSchema.optional(),

    industrySupervisorName: nameSchema,
    industrySupervisorEmail: emailSchema,
    industrySupervisorPosition: z.string().max(255).optional(),
    industrySupervisorPhone: phoneSchema,

    trainingStartDate: z.coerce.date(),
    trainingEndDate: z.coerce.date(),
    jobTitle: z.string().max(255).optional(),
    departmentAtOrg: z.string().max(255).optional(),

    // Logbook metadata
    programOfStudy: z.string().min(2).max(255),
    level: z.string().min(1).max(50),
    session: z.string().min(4).max(50),
    trainingDuration: z.string().max(100),
    areaOfSpecialization: z.string().max(255).optional(),
  })
  .refine((data) => data.trainingEndDate > data.trainingStartDate, {
    message: "Training end date must be after start date",
    path: ["trainingEndDate"],
  })
  .refine((data) => data.placementOrganizationId || data.organizationName, {
    message:
      "Either select an existing organization or provide organization name",
    path: ["organizationName"],
  });

// Create placement organization (admin)
export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(255),
  address: addressSchema,
  city: cityStateSchema,
  state: cityStateSchema,
  phone: phoneSchema,
  email: emailSchema.optional(),
});

// Update placement organization (admin)
export const updateOrganizationSchema = createOrganizationSchema.partial();

// Organization filters
export const organizationFilterSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

// Export types
export type SiwesDetail = z.infer<typeof siwesDetailSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
export type OrganizationFilter = z.infer<typeof organizationFilterSchema>;
