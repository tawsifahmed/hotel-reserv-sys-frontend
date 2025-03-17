<script setup>
import accessPermission from '~/composables/userTypeChecker';
import { FilterMatchMode } from 'primevue/api';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { useRouter } from 'vue-router';

const url = useRuntimeConfig();
const toast = useToast();
const isAdmin = ref(accessPermission('admin'));

// const bookingKey = ref(useRoute().query.booking_key);

definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

const reservationsList = ref([]);
const filters = ref();
const loading = ref(true);
const loading1 = ref(false);
const visibleConfirmModal = ref(false);

const id = ref('');
const actionType = ref(null);
const actionModalMsg = ref(null);

const actionOnRsrv = (key, type) => {
    id.value = key;
    if(type === 'hold'){
        actionType.value = 'pending'
        actionModalMsg.value = type
    }
    if(type === 'approve'){
        actionType.value = 'confirmed'
        actionModalMsg.value = type
    }
    if(type === 'cancel'){
        actionType.value = 'cancelled'
        actionModalMsg.value = type
    }
    
    visibleConfirmModal.value = true;
};

const visibleDetailView = ref(false);

const resSingleData = ref({});

const closeEditModal = (evn) => {
    visibleDetailView.value = false;
    init();
};

const initDetailView = async (key) => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('resView', () =>
        $fetch(`${url.public.apiUrl}/api/v1/reservations/show/${key}`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    console.log('data check =>', data.value);
    if (data.value.code === 200) {
        resSingleData.value = { ...data.value?.data, type: 'admin' };
    }
};

const confirmUpdate = async () => {
    loading1.value = true;
    const token = useCookie('token');
    const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/reservations/update/${id.value}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token.value}`
        },
        body: {
        status: actionType.value,
        }
    });

    if (data.value.code === 200) {
        visibleConfirmModal.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: `Reservation status is ${actionType.value}!`, group: 'br', life: 3000 });
        loading1.value = false;
       
        init();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to change reservation status!', group: 'br', life: 3000 });
        loading1.value = false;
    }
};

const init = async () => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('reservationList', () =>
        $fetch(`${url.public.apiUrl}/api/v1/reservations`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.length > 0) {
        reservationsList.value = data.value?.map((item, index) => ({ ...item, index: index + 1 }));
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
initFilters();

const dateFormatter = (data) => {
    const dateStr = data;
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const handleDetailView = async (key) => {    
    await initDetailView(key);
    visibleDetailView.value = true;
};


const router = ref(useRouter().currentRoute);
watch(
    () => router.value.query?.booking_key,
    (newKey) => {
        if (newKey) {
            handleDetailView(newKey);
        }
    }
);

if (router.value.query?.booking_key) {
    handleDetailView(router.value.query?.booking_key);
}

onMounted(() => {
    init();
    if (isAdmin.value === false) {
        throw createError({ statusCode: 404, message: 'Access denied!', fatal: true });
    }
    loading.value = false;
});
</script>

<template>
    <div class="card">
        <div class="d-flex mr-2">
            <h5 class="mb-1">Reservation List</h5>
         <!-- <pre>  dd {{ router.query }}</pre> -->
        </div>
        <Toolbar class="border-0 px-0">
            <template #start>
            </template>

            <template #end>
                <IconField iconPosition="right" raised>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                </IconField>
            </template>
        </Toolbar>

        <DataTable v-model:filters="filters" class="table-st" :value="reservationsList" stripedRows paginator tableStyle="min-width: 50rem" :rows="30" :rowsPerPageOptions="[5, 10, 20, 30, 50]" dataKey="id" filterDisplay="menu" :loading="loading">
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
            <Column field="room.seats" header="Seat Capacity"></Column>
            <Column field="room.floor.name" header="Floor Layout"></Column>
            <Column field="start_date" header="Check In"></Column>
            <Column field="end_date" header="Check Out"></Column>
            <Column field="created_at" header="Booked At">
                <template #body="slotProps">
                   <p>
                    {{dateFormatter(slotProps?.data?.created_at)}}
                   </p>
                 </template>
            </Column>
            <Column field="room.price_per_night" header="Total Price">
             <template #body="slotProps"> 
                <i>
                    <b>$</b>{{slotProps.data?.total_price }}
                </i>

             </template>
            </Column>
            <Column field="user.name" header="Booked By"></Column>
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
            <Column field="action" header="Action">
                <template #body="slotProps">
                    <Button v-tooltip.top="{ value: 'View' }" icon="pi pi-window-maximize" text severity="info" rounded @click="handleDetailView(slotProps.data.id)" />
                    <Button :disabled="slotProps.data.status === 'confirmed'" v-tooltip.top="{ value: 'Approve reservation' }" icon="pi pi-check" text class="" severity="success" rounded @click="actionOnRsrv(slotProps.data.id, 'approve')" />
                    <Button :disabled="slotProps.data.status === 'pending'"  v-tooltip.top="{ value: 'Hold reservation' }" icon="pi pi-undo" text class="" severity="secondary" rounded @click="actionOnRsrv(slotProps.data.id, 'hold')" />
                    <Button :disabled="slotProps.data.status === 'cancelled'" v-tooltip.top="{ value: 'Cancel reservation' }" icon="pi pi-times" text severity="danger" rounded @click="actionOnRsrv(slotProps.data.id, 'cancel')"/>

                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="visibleConfirmModal" :header="actionModalMsg?.charAt(0).toUpperCase() + actionModalMsg?.slice(1)" dismissableMask="true" :style="{ width: '25rem' }">
            <p>Are you sure you want to <span> <b>{{actionModalMsg}}</b> </span> this reservation?</p>
            <Button label="No" icon="pi pi-times" text @click="visibleConfirmModal = false" />
            <Button label="Yes" icon="pi pi-check" text @click="confirmUpdate" :loading="loading1" />
        </Dialog>

        <Dialog v-model:visible="visibleDetailView" modal header="Reservation View" dismissableMask="true" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <ReservationsDetailView :resSingleData="resSingleData" @closeEditModal="closeEditModal($event)" />
        </Dialog>
        <Toast position="bottom-right" group="br" />
    </div>
</template>

<style lang="scss" scoped>
.table-st {
    border: inherit;
    border-radius: 10px;
    overflow: hidden;
}
.table-st thead tr {
    background: #ededed;
}
</style>
