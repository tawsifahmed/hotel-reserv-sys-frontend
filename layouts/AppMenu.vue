<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
const model = ref([
    {
        label: 'Menu',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/admin-dashboard' },
            { label: 'Reservations', icon: 'pi pi-fw pi-bookmark', to: '/admin-dashboard/reservations' },
            { label: 'Floors', icon: 'pi pi-fw pi-th-large', to: '/admin-dashboard/floors' },
            { label: 'Rooms', icon: 'pi pi-fw pi-ticket', to: '/admin-dashboard/rooms' },
            { label: 'Users', icon: 'pi pi-fw pi-users', to: '/admin-dashboard/users' }
        ]
    },
    {
        label: 'Settings',
        items: [
            { label: 'Reports', icon: 'pi pi-fw pi-flag', to: '/admin-dashboard/reports' },
        ]
    }
]);
</script>

<template>
    <div class="relative">
        <!-- <pre>{{menu}}</pre> -->
        <div class="mt-3">
            <!-- <pre>cList => {{companyList.length}}</pre> -->
            <!-- <pre>pre2: {{selectedComp}}</pre> -->
            <!-- <pre>selC{{selectedCompany}}</pre> -->
            <div class="flex align-items-center">
                <div class="comp-switch w-full">
                    <InputText v-model="name" class="w-full text-center" placeholder="Hotel Reservation System" disabled/>
                </div>
            </div>
            <hr>
        </div>
        <ul class="layout-menu">
            <template v-for="(item, i) in model" :key="item">
                <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
                <li v-if="item.separator" class="menu-separator"></li>
            </template>
        </ul>
    </div>
</template>

<style lang="scss" scoped></style>
