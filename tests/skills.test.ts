import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_SKILL_CATEGORIES, moveItem, validateSkillCategories } from '../lib/skills'

const section = () => [{
  id: 'web', name: ' Web Development ',
  skills: [{ id: 'ts', skill_name: ' TypeScript ', level: 90 }, { id: 'css', skill_name: 'CSS', level: 0 }],
}, { id: 'tools', name: 'Tools', skills: [] }]

test('save validation trims names, retains empty categories and preserves values and order', () => {
  const result = validateSkillCategories(section())
  assert.deepEqual(result.map((category) => category.name), ['Web Development', 'Tools'])
  assert.deepEqual(result[0].skills, [
    { id: 'ts', skill_name: 'TypeScript', level: 90 }, { id: 'css', skill_name: 'CSS', level: 0 },
  ])
  assert.deepEqual(result[1].skills, [])
  assert.deepEqual(validateSkillCategories([]), [])
  assert.doesNotThrow(() => validateSkillCategories(DEFAULT_SKILL_CATEGORIES))
})

test('reordering categories and skills preserves every value and leaves the original untouched', () => {
  const original = validateSkillCategories(section())
  const moved = moveItem(original, 1, -1)
  assert.equal(moved[0].id, 'tools')
  assert.equal(original[0].id, 'web')
  const skills = moveItem(original[0].skills, 0, 1)
  assert.deepEqual(skills.map((skill) => [skill.id, skill.level]), [['css', 0], ['ts', 90]])
  assert.equal(moveItem(original, 0, -1), original)
  assert.equal(moveItem(original, original.length - 1, 1), original)
})

test('duplicate names ignore case and whitespace, while the same skill can exist in different categories', () => {
  const duplicateCategory = section()
  duplicateCategory[1].name = 'web DEVELOPMENT'
  assert.throws(() => validateSkillCategories(duplicateCategory), /Duplicate category/)
  const duplicateSkill = section()
  duplicateSkill[0].skills[1].skill_name = 'typescript'
  assert.throws(() => validateSkillCategories(duplicateSkill), /Duplicate skill/)
  const repeatedAcrossCategories = section()
  repeatedAcrossCategories[1].skills.push({ id: 'other-ts', skill_name: 'TypeScript', level: 100 })
  assert.doesNotThrow(() => validateSkillCategories(repeatedAcrossCategories))
})

test('invalid names, IDs and levels are rejected before any database write', () => {
  for (const level of [-1, 101, 50.5, NaN, Infinity, '90', null]) {
    const invalid = section()
    Object.assign(invalid[0].skills[0], { level })
    assert.throws(() => validateSkillCategories(invalid), /whole number/)
  }
  const duplicateId = section()
  duplicateId[0].skills[0].id = 'web'
  assert.throws(() => validateSkillCategories(duplicateId), /unique ID/)
  for (const invalid of [null, {}, [{ name: '', skills: [] }], [{ id: 'a', name: 'Web', skills: null }], [{ id: 'a', name: 'Web', skills: [null] }]]) {
    assert.throws(() => validateSkillCategories(invalid))
  }
})
