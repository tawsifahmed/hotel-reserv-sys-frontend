<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

import { storeToRefs } from 'pinia'; 
import { useUserStore } from '~/store/user';
import { useAuthStore } from '~/store/auth'; 
import { useLayout } from './composables/layout';
import { useRouter } from 'vue-router';
import accessPermission from '~/composables/userTypeChecker';
import Notification from '../components/Notification.vue';

const url = useRuntimeConfig();


const { logUserOut } = useAuthStore(); 
const { getUserData } = useUserStore();

const { userProfile } = storeToRefs(useUserStore());
const { authenticated } = storeToRefs(useAuthStore()); 

const isAdmin = ref(accessPermission('admin'));

const { layoutConfig, onMenuToggle } = useLayout();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const visibleProfile = ref(false);
// console.log('path', useRoute().path);

const openProfile = () => {
    visibleProfile.value = !visibleProfile.value;
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
const showClientRoute = ref(false);
const showAdminRoute = ref(false);
onMounted(() => {
    if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/my-bookings') {
        isClient.value = true;
    } else {
        isClient.value = false;
    }

    if (isAdmin.value === true) {
        if (router.currentRoute.value.path === '/' || router.currentRoute.value.path === '/my-bookings') {
            showClientRoute.value = true;
        } else if (
            router.currentRoute.value.path === '/admin-dashboard' ||
            router.currentRoute.value.path === '/admin-dashboard/users' ||
            router.currentRoute.value.path === '/admin-dashboard/floors' ||
            router.currentRoute.value.path === '/admin-dashboard/rooms' ||
            router.currentRoute.value.path === '/admin-dashboard/reservations' ||
            router.currentRoute.value.path === '/admin-dashboard/reports'
        ) {
            showAdminRoute.value = true;
        }
    }
});

const isMyBookingsRoute = ref(false);

onMounted(() => {
    isMyBookingsRoute.value = router.currentRoute.value.path === '/my-bookings';
});

getUserData();

const logout = () => {
    logUserOut();
    router.push('/login');
    // location.reload();
};
</script>

<template>
    <div class="layout-topbar">
        <!-- <pre>{{ isAdmin }}</pre> -->
        <router-link to="/" class="layout-topbar-logo flex justify-content-center align-items-center">
            <img src="/demo/images/login/avatar.png" alt="logo" />
            <h5 class="m-0" style="text-wrap: nowrap">Hotel Reservation System</h5>
        </router-link>

        <button v-if="!isClient" class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <div>
                <NuxtLink v-if="showAdminRoute === true" to="/" class="p-link layout-topbar-button mr-5 modified-link">
                    <h5 class="text-nowrap mb-0 m-links">Client Site</h5>
                    <span>Client Site</span>
                </NuxtLink>
                <NuxtLink v-if="showClientRoute === true" to="/admin-dashboard" class="p-link layout-topbar-button mr-5 modified-link" style="margin-right: 95px !important;">
                    <h5 class="text-nowrap mb-0 m-links">Admin Dashboard</h5>
                    <span>Admin Dashboard</span>
                </NuxtLink>
            </div>
            <NuxtLink v-if="isClient === true" to="/my-bookings" class="p-link layout-topbar-button mr-5 modified-link">
                <h5 class="text-nowrap mb-0" :class="isMyBookingsRoute === true ? 'font-bold underline' : ''">My Bookings</h5>
                <span>My Bookings</span>
            </NuxtLink>

            <button @click="openProfile()" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </button>
            <button @click="logout" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Sign Out</span>
            </button>
        </div>
        <Dialog v-model:visible="visibleProfile" modal header="Profile" dismissableMask="true" :style="{ width: '65rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <Profile :userProfile="userProfile" />
        </Dialog>
    </div>
</template>

<style lang="scss" scoped>
.text-nowrap {
    text-wrap: nowrap;
    color: inherit;
}

.modified-link {
    margin-right: 40px !important;
}

.modified-link:hover {
    background: none !important;
}


</style>
