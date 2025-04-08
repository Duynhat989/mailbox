import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: HomePage,
    //   meta: { requiresAuth: false }
    // },
    
  ],
})
function notifyDataChange(data) {
  const event = new CustomEvent('dataChanged', {
    detail: data,
    bubbles: true  // Let the event bubble up the DOM
  });
  document.dispatchEvent(event);
}
// router.beforeEach((to, from, next) => {
//   const isLogin = store.getters.isLogin;
//   if (to.meta.requiresAuth && !isLogin) {
//     localStorage.setItem('intendedRoute', to.fullPath);
//     notifyDataChange({
//       isLogin:false
//     });
//     next('/');
//   } else {
//     next();
//   }
// });

export default router
