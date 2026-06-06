import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type { Database, Json } from "./database.types";
export { Constants } from "./database.types";
export type { Tables, TablesInsert, TablesUpdate } from "./database.types";
export * from "./client";

// Aliases por fila para uso cómodo en la app.
export type Organization = Tables<"organizations">;
export type Member = Tables<"members">;
export type RawEvent = Tables<"raw_events">;
export type Program = Tables<"programs">;
export type Task = Tables<"tasks">;
export type Decision = Tables<"decisions">;
export type Activity = Tables<"activities">;
export type Beneficiary = Tables<"beneficiaries">;
export type ActivityBeneficiary = Tables<"activity_beneficiaries">;
export type Attachment = Tables<"attachments">;
export type Report = Tables<"reports">;

// Inserts más usados.
export type RawEventInsert = TablesInsert<"raw_events">;
export type TaskInsert = TablesInsert<"tasks">;
export type ActivityInsert = TablesInsert<"activities">;

// Updates más usados.
export type TaskUpdate = TablesUpdate<"tasks">;
export type ActivityUpdate = TablesUpdate<"activities">;
