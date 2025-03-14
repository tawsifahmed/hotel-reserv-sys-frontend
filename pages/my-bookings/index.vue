<script setup>
import AppTopbar from '../../layouts/AppTopbar.vue';
import AppFooter from '../../layouts/AppFooter.vue';
const url = useRuntimeConfig();

definePageMeta({
    middleware: 'auth',
    layout: 'false'
});

const toast = useToast();
const myBookingList = ref([]);
const init = async () => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('userBookingList', () =>
        $fetch(`${url.public.apiUrl}/api/v1/users/reservations`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.length > 0) {
        myBookingList.value = data.value?.map((item, index) => ({ ...item, index: index + 1 }));
    }
};
const id = ref(null);
const visibleDeleteFloor = ref(false);
const deleteFloor = (key) => {
    visibleDeleteFloor.value = true;
    id.value = key;
};

const loading1 = ref(false);

const confirmDeleteFloor = async () => {
    loading1.value = true;
    const token = useCookie('token');
    const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/reservations/update/${id.value}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token.value}`
        },
        body: {
        status: 'cancelled',
        }
    });

    if (data.value.code === 200) {
        visibleDeleteFloor.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Floor deleted successfully!', group: 'br', life: 3000 });
        loading1.value = false;
       
        init();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Floor deleted Failed!', group: 'br', life: 3000 });
        loading1.value = false;
    }
};

const tableLoader = ref(true);
onMounted(async () => {
    await init();
    tableLoader.value = false;
});
</script>

<template>
    <div class="main-wrapper">
        <AppTopbar />
        <div class="card dash-banner" style="width: 85%; margin: 0 auto; margin-top: 100px">
            <div class="d-flex mr-2">
                <h5 class="mb-1">My Bookings</h5>
            </div>
            <Toolbar class="border-0 px-0">
                <template #start> </template>
            </Toolbar>

            <DataTable class="table-st" :value="myBookingList" stripedRows paginator tableStyle="min-width: 50rem" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" dataKey="id" filterDisplay="menu" :loading="tableLoader">
                <template #empty> <p class="text-center">No Data found...</p> </template>
                <template #loading> <ProgressSpinner style="width: 50px; height: 50px" /> </template>
                <Column field="index" header="Serial" sortable></Column>

                <Column field="room.name" header="Room Number">
                    <template #body="slotProps">
                       <i>
                           <b>Room No. {{slotProps.data.room.name}}</b>
                       </i>
                    </template>
                   </Column>
                <Column field="room.seats" header="Seats"></Column>
                <Column field="room.floor.name" header="Floor Layout"></Column>
                <Column field="start_date" header="Check In"></Column>
                <Column field="end_date" header="Check Out"></Column>
                <Column field="room.price_per_night" header="Price">
                    <template #body="slotProps"> 
                       <i>
                           <b>$</b>{{slotProps.data.room.price_per_night }}
                       </i>
       
                    </template>
                   </Column>
                <Column field="status" header="Status">
                    <template #body="slotProps">
                        <span :class="{
                            'bg-red-100 text-red-800': slotProps.data.status === 'cancelled',
                            'bg-green-100 text-green-800': slotProps.data.status === 'confirmed',
                            'bg-yellow-100 text-yellow-800': slotProps.data.status === 'pending'
                        }" class="px-2 py-1 rounded" style="border-radius: 5px;">{{slotProps.data.status}}
                    </span>
                    </template>
                </Column>
                <!-- <Column field="email" sortable header="Email Address"></Column> -->
                <!-- <Column field="phone" sortable header="Phone Number"></Column> -->
                <Column field="action" header="Action">
                    <template #body="slotProps">
                        <Button :disabled="slotProps.data.status === 'cancelled' || slotProps.data.status === 'confirmed'" v-tooltip.top="{ value: 'Cancel reservation' }" icon="pi pi-times" text severity="danger" rounded @click="deleteFloor(slotProps.data.id)"/>
                    </template>
                </Column>
            </DataTable>
            <Dialog v-model:visible="visibleDeleteFloor" header="Cancel Booking" dismissableMask="true" :style="{ width: '25rem' }">
                <p>Are you sure you want to cancel ?</p>
                <Button label="No" icon="pi pi-times" text @click="visibleDeleteFloor = false" />
                <Button label="Yes" icon="pi pi-check" text @click="confirmDeleteFloor" :loading="loading1" />
            </Dialog>
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

.dash-banner {
    margin-top: 70px; /* Give space between navbar and banner */
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* Ensure the .dash div takes up all available space */
    overflow-y: auto; /* Allows scrolling when content exceeds height */
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
