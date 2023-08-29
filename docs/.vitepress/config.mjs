import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Community Hive API Docs",
  description: "A reference for integrating a client service with the Community Hive platform.",
  head: [['meta', { name: 'theme-color', content: '#2A9C66' }]],
  base: '/community-hive-api-docs/',
  themeConfig: {
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
          { text: 'Invision Community', link: '/' },
          { text: 'Squarespace', link: '/' },
          { text: 'Wordpress', link: '/' },
          { text: 'Xenforo', link: '/' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JonErickson/community-hive-api-docs' }
    ]
  }
})
