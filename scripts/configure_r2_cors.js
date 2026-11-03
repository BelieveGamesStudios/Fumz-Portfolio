const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) env[line.substring(0, idx).trim()] = line.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
});

const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

async function applyDomainCors() {
  const origins = [
    'https://fumz-portfolio.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  console.log(`Applying targeted CORS configuration to bucket: ${env.R2_BUCKET_NAME}...`);
  console.log('Allowed Origins:', origins);

  const corsParams = {
    Bucket: env.R2_BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE'],
          AllowedOrigins: origins,
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  };

  await r2.send(new PutBucketCorsCommand(corsParams));
  console.log('SUCCESS: Updated CORS policy for https://fumz-portfolio.vercel.app and localhost!');

  const check = await r2.send(new GetBucketCorsCommand({ Bucket: env.R2_BUCKET_NAME }));
  console.log('Active CORS Policy on R2:', JSON.stringify(check.CORSRules, null, 2));
}

applyDomainCors().catch(console.error);
