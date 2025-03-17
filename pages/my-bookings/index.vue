<script setup>
import AppTopbar from '../../layouts/AppTopbar.vue';
import AppFooter from '../../layouts/AppFooter.vue';
const url = useRuntimeConfig();

definePageMeta({
    middleware: 'auth',
    layout: 'false'
});

const bookingKey = useRoute().query.booking_key;

const toast = useToast();
const myBookingList = ref([]);
const id = ref(null);
const visibleDetailView = ref(false);
const visibleDeleteFloor = ref(false);

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

const resSingleData = ref({});

const initDetailView = async (key) => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('bookingView', () =>
        $fetch(`${url.public.apiUrl}/api/v1/reservations/show/${key}`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value.code === 200) {
        resSingleData.value = { ...data.value?.data, type: 'client' };
    }
};
const deleteFloor = (key) => {
    visibleDeleteFloor.value = true;
    id.value = key;
};

const closeEditModal = (evn) => {
    visibleDetailView.value = false;
    init();
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
            status: 'cancelled'
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

const dateFormatter = (data) => {
    const dateStr = data;
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const handleDetailView = async (key) => {
    console.log('key =>', key);
    
    await initDetailView(key);
    visibleDetailView.value = true;
};

watch(
    () => useRoute().query?.booking_key,
    (newKey) => {
        if (newKey) {
            handleDetailView(newKey);
        }
    }
);

if (useRoute().query?.booking_key) {
    handleDetailView(useRoute().query?.booking_key);
}

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
                <!-- id rei {{ bookingKey }} -->
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
                            <b>Room No. {{ slotProps.data.room.name }}</b>
                        </i>
                    </template>
                </Column>
                <Column field="room.seats" header="Seat Capacity"></Column>
                <Column field="room.floor.name" header="Floor Layout"></Column>
                <Column field="start_date" header="Check In"></Column>
                <Column field="end_date" header="Check Out"></Column>
                <Column field="created_at" header="Booked At">
                    <template #body="slotProps">
                        <p>
                            {{ dateFormatter(slotProps?.data?.created_at) }}
                        </p>
                    </template>
                </Column>
                <Column field="total_price" header="Price">
                    <template #body="slotProps">
                        <i> <b>$</b>{{ slotProps.data.total_price }} </i>
                    </template>
                </Column>
                <Column field="status" header="Status">
                    <template #body="slotProps">
                        <span
                            :class="{
                                'bg-red-100 text-red-800': slotProps.data.status === 'cancelled',
                                'bg-green-100 text-green-800': slotProps.data.status === 'confirmed',
                                'bg-yellow-100 text-yellow-800': slotProps.data.status === 'pending'
                            }"
                            class="px-2 py-1 rounded"
                            style="border-radius: 5px"
                            >{{ slotProps.data.status }}
                        </span>
                    </template>
                </Column>
                <Column field="action" header="Action">
                    <template #body="slotProps">
                        <Button v-tooltip.top="{ value: 'View' }" icon="pi pi-window-maximize" text severity="info" rounded @click="handleDetailView(slotProps.data.id)" />
                        <Button
                            :disabled="slotProps.data.status === 'cancelled' || slotProps.data.status === 'confirmed'"
                            v-tooltip.top="{ value: 'Cancel reservation' }"
                            icon="pi pi-times"
                            text
                            severity="danger"
                            rounded
                            @click="deleteFloor(slotProps.data.id)"
                        />
                    </template>
                </Column>
            </DataTable>
            <Dialog v-model:visible="visibleDeleteFloor" header="Cancel Booking" dismissableMask="true" :style="{ width: '25rem' }">
                <p>Are you sure you want to cancel?</p>
                <Button label="No" icon="pi pi-times" text @click="visibleDeleteFloor = false" />
                <Button label="Yes" icon="pi pi-check" text @click="confirmDeleteFloor" :loading="loading1" />
            </Dialog>
            <Toast position="bottom-right" group="br" />
            <Dialog v-model:visible="visibleDetailView" modal header="Reservation View" dismissableMask="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
                <ReservationsDetailView :resSingleData="resSingleData" @closeEditModal="closeEditModal($event)" />
            </Dialog>
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
