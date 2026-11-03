const fs = require('fs');
const path = require('path');

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.substring(0, idx).trim();
    const v = line.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});

const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const R2_PUBLIC_BASE = (env.R2_PUBLIC_URL || '').replace(/\/$/, '');

async function uploadBufferToR2(key, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType || 'application/octet-stream',
  });
  await r2.send(command);
  return `${R2_PUBLIC_BASE}/${key}`;
}

async function migrateUrl(originalUrl, folder) {
  if (!originalUrl || !originalUrl.includes('supabase.co')) {
    return originalUrl;
  }

  try {
    console.log(`[Fetching] ${originalUrl}`);
    const res = await fetch(originalUrl);
    if (!res.ok) {
      console.warn(`Failed to fetch ${originalUrl}: status ${res.status}`);
      return originalUrl;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'application/octet-stream';

    // Parse filename
    const urlObj = new URL(originalUrl);
    const rawFileName = decodeURIComponent(urlObj.pathname.split('/').pop() || `file_${Date.now()}`);
    const cleanFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const r2Key = `${folder}/${cleanFileName}`;

    console.log(`[Uploading to R2] ${r2Key} (${buffer.length} bytes)...`);
    const newR2Url = await uploadBufferToR2(r2Key, buffer, contentType);
    console.log(`[Success] New URL: ${newR2Url}`);
    return newR2Url;
  } catch (err) {
    console.error(`Error migrating URL ${originalUrl}:`, err.message);
    return originalUrl;
  }
}

async function runMigration() {
  console.log('=== STARTING SUPABASE TO CLOUDFLARE R2 MIGRATION ===');
  console.log(`Target Bucket: ${env.R2_BUCKET_NAME}`);
  console.log(`Public Base: ${R2_PUBLIC_BASE}\n`);

  // 1. Migrate Certifications
  console.log('--- Migrating Certifications ---');
  const { data: certs, error: certsErr } = await supabase.from('certifications').select('*');
  if (certsErr) {
    console.error('Error fetching certs:', certsErr);
  } else if (certs && certs.length) {
    for (const cert of certs) {
      if (cert.credential_url && cert.credential_url.includes('supabase.co')) {
        const newUrl = await migrateUrl(cert.credential_url, 'certifications');
        if (newUrl !== cert.credential_url) {
          const { error: updateErr } = await supabase
            .from('certifications')
            .update({ credential_url: newUrl })
            .eq('id', cert.id);
          if (updateErr) {
            console.error(`Failed to update cert ${cert.id}:`, updateErr);
          } else {
            console.log(`Updated cert "${cert.title}" -> ${newUrl}`);
          }
        }
      }
    }
  }

  // 2. Migrate Projects
  console.log('\n--- Migrating Projects ---');
  const { data: projects, error: projErr } = await supabase.from('projects').select('*');
  if (projErr) {
    console.error('Error fetching projects:', projErr);
  } else if (projects && projects.length) {
    for (const proj of projects) {
      let needsUpdate = false;
      const updateData = {};

      if (proj.image_url && proj.image_url.includes('supabase.co')) {
        const newImgUrl = await migrateUrl(proj.image_url, 'projects');
        if (newImgUrl !== proj.image_url) {
          updateData.image_url = newImgUrl;
          needsUpdate = true;
        }
      }

      if (proj.download_url && proj.download_url.includes('supabase.co')) {
        const newDownloadUrl = await migrateUrl(proj.download_url, 'builds');
        if (newDownloadUrl !== proj.download_url) {
          updateData.download_url = newDownloadUrl;
          needsUpdate = true;
        }
      }

      // Check screenshots array
      if (Array.isArray(proj.screenshots) && proj.screenshots.length > 0) {
        let screenshotsChanged = false;
        const newScreenshots = [];
        for (const s of proj.screenshots) {
          if (s && s.url && s.url.includes('supabase.co')) {
            const newShotUrl = await migrateUrl(s.url, 'projects');
            newScreenshots.push({ ...s, url: newShotUrl });
            screenshotsChanged = true;
          } else {
            newScreenshots.push(s);
          }
        }
        if (screenshotsChanged) {
          updateData.screenshots = newScreenshots;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        const { error: updateProjErr } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', proj.id);
        if (updateProjErr) {
          console.error(`Failed to update project ${proj.id}:`, updateProjErr);
        } else {
          console.log(`Updated project "${proj.title}"`);
        }
      }
    }
  }

  console.log('\n=== MIGRATION COMPLETE! ===');
  process.exit(0);
}

runMigration().catch(err => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
