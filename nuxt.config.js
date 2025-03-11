import apiLink from './utils/apiLinks'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false,
    runtimeConfig: {
        public: {
            apiUrl: apiLink,
            // adminEmail: process.env.ADMIN_EMAIL,
            // adminPassword: process.env.ADMIN_PASSWORD
            // apiUrl: process.env.API_URL ?? 'http://localhost:8000'
            // api end point => http://188.166.212.40/api/v1/
        }
    },

    app: {
        head: {
            title: 'Hotel Reservation System',
            link: [
                {
                    id: 'theme-css',
                    rel: 'stylesheet',
                    type: 'text/css',
                    href: '/themes/aura-light-noir/theme.css'
                }
            ]
        }
    },
    modules: ['@pinia/nuxt', 'nuxt-primevue'],
    primevue: {
        options: { ripple: true },
        components: {
            exclude: ['Editor']
        }
    },
    script: [
        {
            strategy: 'lazyOnload',
            src: 'https://www.googletagmanager.com/gtag/js?id=UA-93461466-1'
        },
        {
            id: 'ga-analytics',
            strategy: 'lazyOnload',
            children: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'UA-93461466-1');
            `
        }
    ],
    css: ['primeicons/primeicons.css', 'primeflex/primeflex.scss', 'primevue/resources/primevue.min.css', '@/assets/styles.scss']
});
