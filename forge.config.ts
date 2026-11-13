import type { ForgeConfig } from '@electron-forge/shared-types';
import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const notarizationProfile = process.env.APPLE_NOTARIZATION_KEYCHAIN_PROFILE;

const config: ForgeConfig = {
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      const destination = join(buildPath, 'node_modules');
      await mkdir(destination, { recursive: true });
      await Promise.all(
        ['better-sqlite3', 'node-addon-api'].map((dependency) =>
          cp(
            join(process.cwd(), 'node_modules', dependency),
            join(destination, dependency),
            { recursive: true },
          ),
        ),
      );
    },
  },
  packagerConfig: {
    asar: true,
    ignore: (file) => {
      if (!file) {
        return false;
      }
      return !(
        file.startsWith('/.vite') ||
        file.endsWith('/package.json') ||
        file.includes('/node_modules/better-sqlite3/') ||
        file.includes('/node_modules/node-addon-api/')
      );
    },
    appBundleId: 'com.mickeyzhang.screenme',
    osxSign: {},
    osxNotarize: notarizationProfile
      ? { keychainProfile: notarizationProfile }
      : undefined,
  },
  rebuildConfig: {},
  makers: [new MakerZIP({}, ['darwin'])],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
      [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,
    }),
  ],
};

export default config;
