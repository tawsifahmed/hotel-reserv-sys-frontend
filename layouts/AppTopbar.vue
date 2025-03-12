<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from './composables/layout';
import { useRouter } from 'vue-router';
import accessPermission from '~/composables/userTypeChecker';

const isAdmin = ref(accessPermission('admin'));

const { layoutConfig, onMenuToggle } = useLayout();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useAuthStore } from '~/store/auth'; // import the auth store we just created
// // import { useRoute } from 'vue-router';
// console.log('path', useRoute().path);

const { logUserOut } = useAuthStore(); // use authenticateUser action from  auth store
const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive with storeToRefs


const logout = () => {
  logUserOut();
  router.push('/login');
  // location.reload();
};

onMounted(() => {
    bindOutsideClickListener();
});
onBeforeUnmount(() => {
    unbindOutsideClickListener();
});
// const logoUrl = computed(() => {
//     return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
// });

const onTopBarMenuButton = () => {
    topbarMenuActive.value = !topbarMenuActive.value;
};

const onSettingsClick = () => {
    topbarMenuActive.value = false;
    router.push('/utilities/documentation');
};

const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };

        document.addEventListener('click', outsideClickListener.value);
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};

const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;
    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};

const isClient = ref(true);



onMounted(() => {

    if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/my-bookings' ) {
        isClient.value = true;
    } else {
        isClient.value = false;
    }
});
</script>

<template>
    <div class="layout-topbar">
        <!-- <pre>{{isClient}}</pre> -->
        <router-link to="/" class="layout-topbar-logo flex justify-content-center align-items-center">
            <img src="/demo/images/login/avatar.png" alt="logo" />
            <h5 class="m-0" style="text-wrap:nowrap;">Hotel Reservation System</h5>
        </router-link>

        <button v-if="!isClient" class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <!-- <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                <i class="pi pi-calendar"></i>
                <span>Calendar</span>
            </button> -->
                <NuxtLink v-if="!isAdmin" to="/my-bookings" class="p-link layout-topbar-button mr-5">
                    <h5 class="text-nowrap mb-0">My Bookings</h5>
                    <span>My Bookings</span>
                </NuxtLink>
                <div class="mr-4">
                    <NuxtLink v-if="!isClient" to="/admin-dashboard" class="p-link layout-topbar-button mr-5">
                        <h5 class="text-nowrap mb-0">Admin Dashboard</h5>
                        <span>Admin Dashboard</span>
                    </NuxtLink>
                    
                    <NuxtLink v-else to="/admin-dashboard" class="p-link layout-topbar-button mr-5">
                        <h5 class="text-nowrap mb-0">Admin Dashboard</h5>
                        <span>Admin Dashboard</span>
                    </NuxtLink>
                    
                </div>
            <button @click="onTopBarMenuButton()" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </button>
            <button @click="logout" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Sign Out</span>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.text-nowrap{
    text-wrap: nowrap;
    color: inherit
}
</style>