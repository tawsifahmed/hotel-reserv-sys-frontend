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

const showNotify = ref(false);

const handleOutsideClick = () => {
    if (showNotify.value) {
        // fetchNotifyData();
        showNotify.value = false;
        notifiData.value = false;
    }
};

const closeNotification = (evn) => {
    showNotify.value = evn;
    // fetchNotifyData();
    // notifiData.value = false;
};

const notifiData = ref(false);
const fetchNotifyData = async () => {
    const token = useCookie('token');
    try {
        const { data, pending, error } = await useFetch(`${url.public.apiUrl}/api/v1/notifications?limit=5&page=1`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        });

        if (data.value) {
            if (data.value.data.find((item) => item.is_read === 0)) {
                notifiData.value = true;
            } else {
                notifiData.value = false;
            }
            // totalPage.value = Math.ceil(data.value.total / 5);
        }
    } catch (e) {
        console.log(e);
    }
};

fetchNotifyData();

const handleNotificationComp = () => {
    showNotify.value = !showNotify.value;
    if (notifiData.value) {
        notifiData.value = false;
    }
};

const vClickOutside = {
    beforeMount(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el == event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document?.body.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el) {
        document?.body?.removeEventListener('click', el.clickOutsideEvent);
    }
};

// Add directive to DOM element

onUnmounted(() => {
    const element = document.querySelector('.relative');
    if(element){
        vClickOutside?.unmounted(element);
    }
});



onMounted(() => {
    const element = document.querySelector('.relative');
    vClickOutside?.beforeMount(element, { value: handleOutsideClick });
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
    isClient.value = ['/','/my-bookings','/my-bookings/'].includes(router.currentRoute.value.path);

    if (isAdmin.value && ['/','/my-bookings','/my-bookings/'].includes(router.currentRoute.value.path)) {
        showClientRoute.value = true;
    }

    if (router.currentRoute.value.path.startsWith('/admin-dashboard')) {
        showAdminRoute.value = true;
    }
});

const isMyBookingsRoute = ref(false);

onMounted(() => {
    isMyBookingsRoute.value = ['/my-bookings', '/my-bookings/'].includes(router.currentRoute.value.path);
});

getUserData();

const logoutDialogShow = ref(false);
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

        <!-- <button v-if="!isClient" class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button> -->

        <button class="p-link layout-topbar-menu-button layout-topbar-button" @click="onTopBarMenuButton()">
            <i class="pi pi-ellipsis-v"></i>
        </button>
        <div class="p-link layout-topbar-menu-button layout-topbar-button">
            <button class="nav-btn" @click="handleNotificationComp">
                <div v-if="showNotify" class="notification">
                    <Notification @closeNotification="closeNotification($event)" />
                </div>
                <i class="pi pi-bell"></i>
            </button>
            <button class="nav-btn" @click="onTopBarMenuButton()">
                <i class="pi pi-ellipsis-v"></i>
            </button>
        </div>

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
            <div class="relative">
                <div v-if="notifiData" class="ping-container">
                    <span class="ping-outer"></span>
                    <span class="ping-inner"></span>
                </div>
                <button @click="handleNotificationComp" class="p-link layout-topbar-button notify-btn ml-0">
                    <i class="pi pi-bell"></i>
                    <span class="ml-4">Notification</span>
                </button>

                <div v-if="showNotify" class="notification">
                    <Notification @closeNotification="closeNotification($event)" />
                </div>
            </div>

            <button @click="openProfile()" class="p-link layout-topbar-button">
                <i class="pi pi-user"></i>
                <span>Profile</span>
            </button>
            <button @click="logoutDialogShow = true" class="p-link layout-topbar-button">
                <i class="pi pi-sign-out"></i>
                <span>Sign Out</span>
            </button>
        </div>
        <Dialog v-model:visible="visibleProfile" modal header="Profile" dismissableMask="true" :style="{ width: '65rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <Profile :userProfile="userProfile" />
        </Dialog>
        <Dialog v-model:visible="logoutDialogShow" modal header="Signing out?" :style="{ width: '25rem' }" dismissableMask="true">
            <p>Are you sure you want to sign out?</p>
            <Button label="No" icon="pi pi-times" text @click="logoutDialogShow = false" />
            <Button label="Yes" icon="pi pi-check" :loading="btnLoading" text @click="logout" />
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

.notify-btn {
    @media (max-width: 991px) {
        display: none !important;
    }
}

.notification {
    position: absolute;
    right: 0;
    top: 4rem;
}

.ping-container {
    position: absolute;
    display: inline-flex;
    height: 12px;
    width: 12px;
    left: 21px;
    top: 5px;
    z-index: 1000;
}

.ping-outer {
    position: absolute;
    height: 100%;
    width: 100%;
    border-radius: 9999px;
    background-color: #6366f1;
    opacity: 0.75;
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.ping-inner {
    position: relative;
    display: inline-flex;
    height: 12px;
    width: 12px;
    border-radius: 9999px;
    background-color: #0ea5e9;
}

@keyframes ping {
    75%,
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

</style>
