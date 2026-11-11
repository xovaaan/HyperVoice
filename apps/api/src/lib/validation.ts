import { z } from "zod";
import { languages, rewriteModes } from "./types";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const passwordField = z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH);

export const registerSchema = z.object({
  email: z.string().trim().email().max(320),
  password: passwordField,
  displayName: z.string().trim().max(200).optional().nullable()
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(320),
  // Not length-checked beyond a sane maximum so that the error does not reveal the policy.
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH)
});

export const cleanupSchema = z.object({
  transcript: z.string().min(1).max(12000),
  mode: z.enum(rewriteModes),
  language: z.enum(languages),
  saveHistory: z.boolean().optional().default(true),
  sourceApp: z.string().max(200).optional(),
  durationSec: z.number().int().optional().nullable()
});

export const rewriteSchema = z.object({
  text: z.string().min(1).max(12000),
  instruction: z.string().min(1).max(2000),
  language: z.enum(languages),
  saveHistory: z.boolean().optional().default(true)
});

export const dictionaryCreateSchema = z.object({
  word: z.string().trim().min(1).max(120),
  hint: z.string().max(200).optional().nullable(),
  category: z.string().max(80).optional().nullable()
});

export const settingsPatchSchema = z.object({
  saveHistory: z.boolean().optional(),
  defaultLanguage: z.enum(languages).optional(),
  defaultMode: z.enum(rewriteModes).optional()
});

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
