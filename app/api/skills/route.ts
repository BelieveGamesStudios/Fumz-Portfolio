import { getPublicSkillCategories } from '@/app/actions/public'

export async function GET() {
  const categories = await getPublicSkillCategories()
  if (categories === null) return Response.json([], { status: 500 })
  // Keep the flat skill response for existing API consumers, in display order.
  return Response.json(categories.flatMap((category) =>
    category.skills.map((skill) => ({ ...skill, category: category.name })),
  ))
}
