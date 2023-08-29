import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: "Community Hive API Documentation",
  description: "A reference for integrating a client application with the Community Hive platform.",
  head: [['meta', { name: 'theme-color', content: '#2A9C66' }]],
  base: '/community-hive-api-docs/',
  themeConfig: {
    siteTitle: false,
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' }
    ],

    sidebar: [
      {
        text: 'Documentation',
        items: [
          { text: 'Getting Started', link: '/getting-started' },
        ]
      },
      {
        text: 'Existing Integrations',
        items: [
          { text: 'Invision Community', link: 'https://communityhive.com/about/integrations/invision-community' },
          { text: 'Squarespace', link: 'https://communityhive.com/about/integrations/squarespace' },
          { text: 'Wordpress', link: 'https://communityhive.com/about/integrations/wordpress' },
          { text: 'Xenforo', link: 'https://communityhive.com/about/integrations/xenforo' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JonErickson/community-hive-api-docs' }
    ]
  }
})
