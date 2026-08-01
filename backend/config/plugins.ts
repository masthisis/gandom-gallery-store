import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

function uploadConfig(env: Core.Config.Shared.ConfigParams['env']) {
  const security = {
    allowedTypes: allowedMediaTypes,
    deniedTypes: deniedExecutableTypes,
  };

  const bucket = env('AWS_BUCKET', '');
  const accessKeyId = env('AWS_ACCESS_KEY_ID', '');
  const secretAccessKey = env('AWS_ACCESS_SECRET', '');
  const endpoint = env('AWS_ENDPOINT', '');

  if (bucket && accessKeyId && secretAccessKey && endpoint) {
    return {
      config: {
        provider: 'aws-s3',
        providerOptions: {
          baseUrl: env('CDN_URL') || undefined,
          rootPath: env('CDN_ROOT_PATH', ''),
          s3Options: {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
            endpoint,
            region: env('AWS_REGION', 'default'),
            forcePathStyle: env.bool('AWS_S3_FORCE_PATH_STYLE', true),
            params: {
              ACL: env('AWS_ACL', 'public-read'),
              signedUrlExpires: env.int('AWS_SIGNED_URL_EXPIRES', 15 * 60),
              Bucket: bucket,
            },
          },
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
        security,
      },
    };
  }

  return {
    config: {
      security,
    },
  };
}

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: uploadConfig(env),
  webbycommerce: {
    enabled: true,
    resolve: './node_modules/@webbycrown/webbycommerce',
  },
  'gandom-shop': {
    enabled: true,
    resolve: './src/plugins/gandom-shop',
  },
  chartbrew: {
    enabled: true,
    resolve: './node_modules/@chartbrew/plugin-strapi',
  },
});

export default config;
