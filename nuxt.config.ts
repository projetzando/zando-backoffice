import pkg from './package.json'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxt/ui',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/fonts',
    '@nuxtjs/supabase',
  ],
  ssr: false,

  components: [
    '~/components',
    {
      path: '~/pages',
      pattern: '**/components/**',

      pathPrefix: false,
    },
  ],
  imports: {
    dirs: ['stores', 'utils/**'],
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'NKUNA Marketplace',
      meta: [
        {
          charset: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          hid: 'description',
          name: 'description',
          content: 'NKUNA Marketplace',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
    },
  },

  css: ['@/assets/css/index.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    storageKey: 'theme-color',
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },

  devServer: {
    port: 3006,
  },
  compatibilityDate: '2024-11-01',
  hooks: {
    'pages:extend'(pages: { path: { includes: (arg0: string) => any } }[]) {
      const pagesToRemove: any[] = []

      pages.forEach((page: { path: { includes: (arg0: string) => any } }) => {
        if (page.path.includes('component')) pagesToRemove.push(page)
      })

      pagesToRemove.forEach((page: any) => {
        pages.splice(pages.indexOf(page), 1)
      })
    },
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  piniaPluginPersistedstate: {
    storage: 'cookies',
    cookieOptions: {
      sameSite: 'lax',
    },
    debug: true,
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*'],
    },
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config',
    exposeConfig: true,
    quiet: true,
    viewer: true,
  },
})
