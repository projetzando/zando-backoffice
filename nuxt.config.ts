import pkg from './package.json';

export default defineNuxtConfig({
  ssr: false,
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: "Zando",
      meta: [
        {
          charset: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          hid: "description",
          name: "description",
          content: "Zando",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/logo.png" }],
    },
  },

  devServer: {
    port: 3006
  },

  future : {
    compatibilityVersion : 4
  },

  css: [
    '@/assets/css/index.css',
    '@/assets/css/tailwind.css',
  ],
  modules: [
    '@pinia/nuxt',
    '@nuxt/ui',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/fonts',
    '@nuxtjs/supabase'
  ],
  imports: {
    dirs: ['stores', 'utils/**'],
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/*']
    }
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config',
    exposeConfig: true,
    quiet: true,
    viewer: true,
  },
  colorMode: {
    preference: 'light',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    storageKey: 'theme-color'
  },
  piniaPluginPersistedstate: {
    storage: 'cookies',
    cookieOptions: {
      sameSite: 'lax',
    },
    debug: true,
  },
  hooks: {
    'pages:extend'(pages: { path: { includes: (arg0: string) => any } }[]) {
      const pagesToRemove: any[] = []

      pages.forEach((page: { path: { includes: (arg0: string) => any } }) => {
        if (page.path.includes('component')) pagesToRemove.push(page)
      })

      pagesToRemove.forEach((page: any) => {
        pages.splice(pages.indexOf(page), 1)
      })
    }
  },

  components: [
    '~/components', {
      path: '~/pages',
      pattern: '**/components/**',

      pathPrefix: false
    },
  ],
  compatibilityDate: '2024-11-01',

  icon: {
    provider : 'server',
    serverBundle: {
      collections: ['iconoir', 'heroicons'] 
    }
  },
  
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
})
