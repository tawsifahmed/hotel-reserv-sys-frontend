export default defineNuxtPlugin((nuxtApp) => {
    const router = useRouter();
  
    router.afterEach((to, from) => {
      if (process.client && to.query.booking_key) {
        const { booking_key, ...remainingQuery } = to.query;
  
        setTimeout(()=>{
          router.replace({ query: remainingQuery });
        }, 1500);
      }
    });
  });