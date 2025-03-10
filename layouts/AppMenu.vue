<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
// import accessPermission from '~/composables/usePermission';
// import { storeToRefs } from 'pinia';
// import { useActiveCompanyStore } from '~/store/workCompany';
// import { useCompanyStore } from '~/store/company'; // import the auth store we just created


const toast = useToast();

// const readDashboard = ref(accessPermission('read_dashboard'));

// const readEmployee = ref(accessPermission('read_user'));

// const readRole = ref(accessPermission('read_role'));

// const readTags = ref(accessPermission('read_tags'));

// const readSpace = ref(accessPermission('read_space'));

const model = ref([
    {
        label: 'Spaces',
        option: 'space_option',
        items: ''
    },
    {
        label: 'Settings',
        option: 'settings_option',
        items: []
    },
    {
        label: 'Reports',
        option: 'reports_option',
        items: [
            { label: "User's Task Summary", icon: 'pi pi-fw pi-flag', to: '/user-task-summary' },
            { label: 'User Reports', icon: 'pi pi-fw pi-flag', to: '/user-reports' },
            { label: 'Task Reports', icon: 'pi pi-fw pi-flag', to: '/task-reports' },
            { label: 'Project Reports', icon: 'pi pi-fw pi-flag', to: '/project-reports' },
            // { label: 'Time Sheet', icon: 'pi pi-fw pi-database', to: '/time-sheet' },
            { label: 'KPI Reports', icon: 'pi pi-fw pi-book', to: '/kpi-reports' }
        ]
    }
]);



// const visibleCreateCompany = ref(false);

</script>

<template>
    <div class="relative">
        <!-- <pre>{{menu}}</pre> -->
        <div class="mt-3">
            <!-- <pre>cList => {{companyList.length}}</pre> -->
            <!-- <pre>pre2: {{selectedComp}}</pre> -->
            <!-- <pre>selC{{selectedCompany}}</pre> -->

                <!-- <Menu ref="menu1" id="overlay_menu" @click="clickCompanyMenu(cItems)" :model="cItems" :popup="true" /> -->
        </div>
        <hr />
        <!-- <ul class="layout-menu">
            <template v-for="(item, i) in model" :key="item.id">
                <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
                <li v-if="item.separator" class="menu-separator"></li>
            </template>
        </ul> -->
    </div>
</template>

<style lang="scss">
.rounded {
    border-radius: 6px;
    text-transform: capitalize;
}

.comp-switch {
    width: 75.1%;
    min-width: 75.1%;
}

.comp-switch > div > .p-inputtext {
    font-size: 1.3rem !important;
    font-weight: 700 !important;
}
.comp-switch > div > .p-dropdown-trigger {
    width: 2rem !important;
}

.company-first-letter {
    min-width: 2.7rem;
    height: 2.7rem;
}

.cLogo{
    
   
    img{
        width: 2.7rem;
    height: 2.7rem;
        border-radius: 5px;
    }
}

.fullscreen-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(100px);
    background-color: white; /* Semi-transparent background */
    z-index: 10999 !important; /* Ensure it's on top of all other elements */
}

.waved-logo {
    background-image: url('/demo/images/login/avatar.png');
    background-size: cover;
    background-repeat: no-repeat;
    width: 80px;
    height: 80px;
    margin: 0 auto;
    animation: waveIconPulse 1.83s 0.4s infinite;
}

.loader-wrapper {
    top: -84px;
    left: -74.5px;
    width: 240px;
    height: 240px;
}

@keyframes waveIconPulse {
    0% {
        transform: scaleZ(1);
    }
    30% {
        transform: scale3d(1.1, 1.1, 1.1);
    }
    60% {
        transform: scale3d(1.1, 1.1, 1.1);
    }
    100% {
        transform: scaleZ(1);
    }
}
</style>
