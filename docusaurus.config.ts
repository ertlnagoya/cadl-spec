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

  url: 'https://www.ertl.jp',
  baseUrl: '/cadl-spec/',

  organizationName: 'ertlnagoya',
  projectName: 'cadl-spec',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        language: ['en', 'ja'],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

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
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'CADL',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'quickstartSidebar',
          position: 'left',
          label: 'Quick Start',
        },
        {
          type: 'docSidebar',
          sidebarId: 'specSidebar',
          position: 'left',
          label: 'Specification',
        },
        {
          type: 'docSidebar',
          sidebarId: 'handsonSidebar',
          position: 'left',
          label: 'Hands-on',
        },
        {
          href: 'https://cadl-explorer.streamlit.app/',
          label: 'CADL Explorer',
          position: 'right',
        },
        {
          type: 'localeDropdown',
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
              label: 'Quick Start',
              to: '/docs/quickstart/',
            },
            {
              label: 'Specification',
              to: '/docs/spec/intro',
            },
            {
              label: 'Hands-on',
              to: '/docs/handson/',
            },
          ],
        },
        {
          title: 'Tools',
          items: [
            {
              label: 'CADL Explorer',
              href: 'https://cadl-explorer.streamlit.app/',
            },
          ],
        },
        {
          title: 'Organization',
          items: [
            {
              label: 'ERTL',
              href: 'https://www.ertl.jp/',
            },
            {
              label: 'Nagoya University',
              href: 'https://www.nagoya-u.ac.jp/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ERTL, Nagoya University. Documentation licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; code examples under the Apache License 2.0. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'typescript', 'solidity', 'json', 'bash', 'ebnf'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
