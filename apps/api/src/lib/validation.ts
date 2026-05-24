import { z } from "zod";
import { languages, rewriteModes } from "./types";

export const initUserSchema = z.object({
  deviceId: z.string().min(3).max(200),
  email: z.string().email().max(320).optional().nullable(),
  displayName: z.string().max(200).optional().nullable()
});

export const cleanupSchema = z.object({
  userId: z.string().cuid(),
  transcript: z.string().min(1).max(12000),
  mode: z.enum(rewriteModes),
  language: z.enum(languages),
  saveHistory: z.boolean().optional().default(true),
  sourceApp: z.string().max(200).optional(),
  durationSec: z.number().int().optional().nullable()
});

export const rewriteSchema = z.object({
  userId: z.string().cuid(),
  text: z.string().min(1).max(12000),
  instruction: z.string().min(1).max(2000),
  language: z.string().min(2).max(20),
  saveHistory: z.boolean().optional().default(true)
});

export const dictionaryCreateSchema = z.object({
  userId: z.string().cuid(),
  word: z.string().min(1).max(120),
  hint: z.string().max(200).optional().nullable(),
  category: z.string().max(80).optional().nullable()
});

export const settingsPatchSchema = z.object({
  userId: z.string().cuid(),
  saveHistory: z.boolean().optional(),
  defaultLanguage: z.string().min(2).max(20).optional(),
  defaultMode: z.enum(rewriteModes).optional()
});

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
