import { Prisma } from "@prisma/client"
import { prisma } from "./prisma"

export type GenderValue = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"

type UserProfileRow = {
  id: string
  email: string
  password: string
  username: string
  bio: string | null
  image: string | null
  createdAt: Date | string
  birthDate: Date | string | null
  gender: GenderValue | null
  country: string | null
  showBirthDate: boolean | null
  showGender: boolean | null
  showCountry: boolean | null
}

export type UserProfile = {
  id: string
  email: string
  password: string
  username: string
  bio: string | null
  image: string | null
  createdAt: Date
  birthDate: Date | null
  gender: GenderValue
  country: string | null
  showBirthDate: boolean
  showGender: boolean
  showCountry: boolean
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

function mapUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    username: row.username,
    bio: row.bio,
    image: row.image,
    createdAt: toDate(row.createdAt),
    birthDate: row.birthDate ? toDate(row.birthDate) : null,
    gender: row.gender ?? "PREFER_NOT_TO_SAY",
    country: row.country,
    showBirthDate: row.showBirthDate ?? true,
    showGender: row.showGender ?? true,
    showCountry: row.showCountry ?? true,
  }
}

export async function getUserProfileById(userId: string) {
  const rows = await prisma.$queryRaw<UserProfileRow[]>(Prisma.sql`
    SELECT
      id,
      email,
      password,
      username,
      bio,
      image,
      "createdAt",
      "birthDate",
      gender,
      country,
      "showBirthDate",
      "showGender",
      "showCountry"
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `)

  const row = rows[0]
  return row ? mapUserProfile(row) : null
}

export async function findUserIdByUsername(username: string, excludedUserId?: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id
    FROM "User"
    WHERE username = ${username}
      AND (${excludedUserId ?? null}::text IS NULL OR id <> ${excludedUserId ?? null})
    LIMIT 1
  `)

  return rows[0]?.id ?? null
}

export async function updateUserProfile(input: {
  userId: string
  username: string
  bio: string | null
  image: string | null
  birthDate: Date | null
  gender: GenderValue
  country: string | null
  showBirthDate: boolean
  showGender: boolean
  showCountry: boolean
}) {
  const rows = await prisma.$queryRaw<UserProfileRow[]>(Prisma.sql`
    UPDATE "User"
    SET
      username = ${input.username},
      bio = ${input.bio},
      image = ${input.image},
      "birthDate" = ${input.birthDate},
      gender = CAST(${input.gender} AS "Gender"),
      country = ${input.country},
      "showBirthDate" = ${input.showBirthDate},
      "showGender" = ${input.showGender},
      "showCountry" = ${input.showCountry}
    WHERE id = ${input.userId}
    RETURNING
      id,
      email,
      password,
      username,
      bio,
      image,
      "createdAt",
      "birthDate",
      gender,
      country,
      "showBirthDate",
      "showGender",
      "showCountry"
  `)

  const row = rows[0]
  return row ? mapUserProfile(row) : null
}
