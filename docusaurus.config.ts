import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CADL',
  tagline: 'Contract Architecture Description Language',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://ertlnagoya.github.io',
  baseUrl: '/cadl-spec/',

  organizationName: 'ertlnagoya',
  projectName: 'cadl-spec',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    localeConfigs: {
      en: {
        htmlLang: 'en-US',
        label: 'English',
      },
      ja: {
        htmlLang: 'ja',
        label: '日本語',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/ertlnagoya/cadl-spec/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/cadl-social-card.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'CADL',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'specSidebar',
          position: 'left',
          label: 'Specification',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/ertlnagoya/cadl',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Specification',
              to: '/docs/spec/intro',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitHub (CADL)',
              href: 'https://github.com/ertlnagoya/cadl',
            },
            {
              label: 'GitHub (Spec)',
              href: 'https://github.com/ertlnagoya/cadl-spec',
            },
          ],
        },
        {
          title: 'Organization',
          items: [
            {
              label: 'Matsubara Laboratory',
              href: 'https://www.ertl.jp/',
            },
            {
              label: 'Nagoya University',
              href: 'https://www.nagoya-u.ac.jp/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Matsubara Laboratory, Nagoya University. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'typescript', 'solidity', 'json', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
