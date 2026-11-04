import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeTags, normalizeWebsiteUrl, projectDetailsForSave } from '../lib/project-details'

test('tags trim whitespace and reject empty or case-insensitive duplicates', () => {
  assert.deepEqual(normalizeTags([' React ', 'react', '', 'Web', 'WEB', '  ']), ['React', 'Web'])
})

test('existing projects default to Download with no tags or website', () => {
  assert.deepEqual(projectDetailsForSave({}), {
    tags: [], action_type: 'download', website_url: null, download_url: null,
  })
})

test('both modes allow an empty link and retain a supplied website', () => {
  for (const action_type of ['download', 'website'] as const) {
    assert.equal(projectDetailsForSave({ action_type }).website_url, null)
    const saved = projectDetailsForSave({
      action_type,
      website_url: ' https://example.com/demo ',
      download_url: 'https://example.com/build.zip',
    })
    assert.equal(saved.website_url, 'https://example.com/demo')
    assert.equal(saved.download_url, 'https://example.com/build.zip')
    assert.equal(saved.action_type, action_type)
  }
})

test('website URLs permit HTTP and HTTPS and reject unsafe or incomplete URLs', () => {
  assert.equal(normalizeWebsiteUrl(' http://localhost:3000/demo '), 'http://localhost:3000/demo')
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'example.com', 'not a url', 'ftp://example.com']) {
    assert.throws(() => normalizeWebsiteUrl(url), /valid website URL/)
  }
})

test('invalid action values are rejected at the save boundary', () => {
  // @ts-expect-error Check untrusted input received by a server action.
  assert.throws(() => projectDetailsForSave({ action_type: 'invalid' }), /Choose Download or Website/)
})
