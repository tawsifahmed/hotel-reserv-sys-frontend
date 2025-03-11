import { useAuthStore } from '~/store/auth'; 
export default defineNuxtRouteMiddleware((to, from) => {
    const { authenticated } = storeToRefs(useAuthStore()); 
    const token = useCookie('token'); 
    // console.log('token', token.value)

    // console.log('to', to)
    // console.log('from', from)
  
    if (token.value) {
      authenticated.value = true; 
    }
  
    if (token.value && (to.name === 'login' || to.name === 'register')) {
      return navigateTo('/');
  }

  if (!token.value && to.name === 'register') {
      return;
  }

  if (!token.value && to.name !== 'login') {
      abortNavigation();
      return navigateTo('/login');
  }
})