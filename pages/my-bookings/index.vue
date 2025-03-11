<script setup>

import AppTopbar from '../../layouts/AppTopbar.vue';
import AppFooter from '../../layouts/AppFooter.vue';
const url = useRuntimeConfig();


definePageMeta({
    layout: 'false'
});

const myBookingList = ref([]);
onMounted(() => {

});
</script>

<template>
    <div class="main-wrapper">
        <AppTopbar />
        <div class="card dash-banner">
            <div class="d-flex mr-2">
                <h5 class="mb-1">My Bookings</h5>
            </div>
            <Toolbar class="border-0 px-0">
                <template #start>
                    <Button icon="pi pi-plus" label="Create" class="mr-2" severity="secondary" />
                    <!-- <Button icon="pi pi-file-excel" label="" class="mr-2" severity="secondary" />
                    <Button icon="pi pi-upload" label="" class="mr-2" severity="secondary" />
                    <Button icon="pi pi-users" @click="handleInviteUserModal" label="Invite a guest" severity="secondary" /> -->
                </template>

            </Toolbar>
    
            <DataTable class="table-st" :value="myBookingList" stripedRows paginator tableStyle="min-width: 50rem" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" dataKey="id" filterDisplay="menu" :loading="loading">
                <template #empty> <p class="text-center">No Data found...</p> </template>
                <template #loading> <ProgressSpinner style="width: 50px; height: 50px" /> </template>
                <Column field="index" header="Serial" sortable></Column>
    
                <Column field="name" header="Room Name"></Column>
                <Column field="name" header="Check In"></Column>
                <Column field="name" header="Check Out"></Column>
                <!-- <Column field="email" sortable header="Email Address"></Column> -->
                <!-- <Column field="phone" sortable header="Phone Number"></Column> -->
                <Column field="action" header="Action">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" text class="" severity="success" rounded  />
                        <Button icon="pi pi-pencil" text class="" severity="success" rounded style="visibility: hidden" />
                        <Button icon="pi pi-trash" text class="" severity="warning" rounded />
                        <Button icon="pi pi-trash" text class="" severity="warning" rounded style="visibility: hidden" />
                    </template>
                </Column>            </DataTable>

            <Toast position="bottom-right" group="br" />
        </div>
        <AppFooter />
    </div>
</template>

<style lang="scss" scoped>

.main-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh; 
}

.dash-banner{
    margin-top: 70px; /* Give space between navbar and banner */
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* Ensure the .dash div takes up all available space */
    overflow-y: auto; /* Allows scrolling when content exceeds height */
    max-height: calc(100vh - 370px); /* Ensure the dash doesn't exceed available height */
    padding: 20px;
}


.table-st {
    border: 1px solid #ededed;
    border-radius: 10px;
    overflow: hidden;
}
.table-st thead tr {
    background: #ededed;
}
</style>
