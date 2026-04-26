import { prisma } from "./prisma"

export type GenderValue = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"
export type ProfileLinkPlatform = "FACEBOOK" | "INSTAGRAM" | "X" | "PATREON" | "KOFI" | "OTHER"

export type ProfileLink = {
  id: string
  platform: ProfileLinkPlatform
  label: string | null
  url: string
  sortOrder: number
}

type BaseUserProfile = {
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

export type UserProfile = BaseUserProfile & {
  profileLinks: ProfileLink[]
}

type ProfileLinkRow = {
  id: string
  platform: ProfileLinkPlatform
  label: string | null
  url: string
  sortOrder: number
}

type PrismaExecutor = Pick<typeof prisma, "$queryRawUnsafe" | "$executeRawUnsafe">

function mapUserProfile(user: BaseUserProfile, profileLinks: ProfileLink[]): UserProfile {
  return {
    ...user,
    gender: user.gender ?? "PREFER_NOT_TO_SAY",
    showBirthDate: user.showBirthDate ?? true,
    showGender: user.showGender ?? true,
    showCountry: user.showCountry ?? true,
    profileLinks,
  }
}

function isMissingProfileLinksStorage(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  return (
    error.message.includes('relation "ProfileLink" does not exist') ||
    error.message.includes('type "LinkPlatform" does not exist') ||
    error.message.includes('column "sortOrder" does not exist')
  )
}

async function getProfileLinksByUserId(executor: PrismaExecutor, userId: string) {
  try {
    const rows = await executor.$queryRawUnsafe<ProfileLinkRow[]>(
      `SELECT id, platform, label, url, "sortOrder"
       FROM "ProfileLink"
       WHERE "userId" = $1
       ORDER BY "sortOrder" ASC, "createdAt" ASC`,
      userId
    )

    return rows.map((row) => ({
      id: row.id,
      platform: row.platform,
      label: row.label,
      url: row.url,
      sortOrder: Number(row.sortOrder ?? 0),
    }))
  } catch (error) {
    if (isMissingProfileLinksStorage(error)) {
      return []
    }

    throw error
  }
}

async function clearProfileLinks(executor: PrismaExecutor, userId: string) {
  try {
    await executor.$executeRawUnsafe(`DELETE FROM "ProfileLink" WHERE "userId" = $1`, userId)
  } catch (error) {
    if (isMissingProfileLinksStorage(error)) {
      return false
    }

    throw error
  }

  return true
}

async function insertProfileLinks(
  executor: PrismaExecutor,
  userId: string,
  profileLinks: Array<{
    platform: ProfileLinkPlatform
    label: string | null
    url: string
  }>
) {
  for (const [index, link] of profileLinks.entries()) {
    await executor.$executeRawUnsafe(
      `INSERT INTO "ProfileLink" (id, platform, label, url, "sortOrder", "createdAt", "userId")
       VALUES ($1, CAST($2 AS "LinkPlatform"), $3, $4, $5, NOW(), $6)`,
      crypto.randomUUID(),
      link.platform,
      link.label,
      link.url,
      index,
      userId
    )
  }
}

async function replaceProfileLinks(
  executor: PrismaExecutor,
  userId: string,
  profileLinks: Array<{
    platform: ProfileLinkPlatform
    label: string | null
    url: string
  }>
) {
  const storageReady = await clearProfileLinks(executor, userId)

  if (!storageReady) {
    return
  }

  await insertProfileLinks(executor, userId, profileLinks)
}

export async function getUserProfileById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return null
  }

  const profileLinks = await getProfileLinksByUserId(prisma, userId)
  return mapUserProfile(user, profileLinks)
}

export async function findUserIdByUsername(username: string, excludedUserId?: string) {
  const user = await prisma.user.findFirst({
    where: {
      username,
      ...(excludedUserId ? { id: { not: excludedUserId } } : {}),
    },
    select: { id: true },
  })

  return user?.id ?? null
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
  profileLinks: Array<{
    platform: ProfileLinkPlatform
    label: string | null
    url: string
  }>
}) {
  const user = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: input.userId },
      data: {
        username: input.username,
        bio: input.bio,
        image: input.image,
        birthDate: input.birthDate,
        gender: input.gender,
        country: input.country,
        showBirthDate: input.showBirthDate,
        showGender: input.showGender,
        showCountry: input.showCountry,
      },
    })

    await replaceProfileLinks(tx, input.userId, input.profileLinks)
    const profileLinks = await getProfileLinksByUserId(tx, input.userId)

    return mapUserProfile(updatedUser, profileLinks)
  })

  return user
}
