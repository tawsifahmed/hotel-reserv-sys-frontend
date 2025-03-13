<script setup>
import accessPermission from '~/composables/userTypeChecker';
import { FilterMatchMode } from 'primevue/api';

import Column from 'primevue/column';

import DataTable from 'primevue/datatable';
const url = useRuntimeConfig();
definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

const toast = useToast();

const isAdmin = ref(accessPermission('admin'));
const filters = ref();
const loading = ref(true);
const loading1 = ref(false);

const visibleCreateTag = ref(false);

const visibleEditTag = ref(false);

const reservationsList = ref([]);

const visibleDeleteTag = ref(false);

const id = ref('');

const name = ref('');

const email = ref('');

const phone = ref('');

const address = ref('');

const closeCreateModal = (evn) => {
    visibleCreateTag.value = false;
    init();
};

const closeEditModal = (evn) => {
    visibleEditTag.value = false;
    init();
};

const handleCreateTagModal = () => {
    visibleCreateTag.value = true;
    init();
};

const editTag = (data) => {
    visibleDeleteTag.value = true;
    id.value = data.id;
    name.value = data.name;
    email.value = data.email;
    phone.value = data.phone;
    address.value = data.address;
};

const actionType = ref(null)
const actionModalMsg = ref(null)
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
    
    visibleDeleteTag.value = true;
};

const confirmDeleteTag = async () => {
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
        visibleDeleteTag.value = false;
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
onMounted(() => {
    init();
    if (isAdmin.value === false) {
        throw createError({ statusCode: 404, message: 'Access denied!', fatal: true });
    }
    loading.value = false;
});

initFilters();
</script>

<template>
    <div class="card">
        <div class="d-flex mr-2">
            <h5 class="mb-1">Reservation List</h5>
        </div>
        <Toolbar class="border-0 px-0">
            <template #start>
                <!-- <Button icon="pi pi-file-excel" label="" class="mr-2" severity="secondary" />
                <Button icon="pi pi-upload" label="" class="mr-2" severity="secondary" />
                <Button icon="pi pi-users" @click="handleInviteUserModal" label="Invite a guest" severity="secondary" /> -->
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

            <Column field="room.name" header="Room No."></Column>
            <Column field="room.seats" header="Seats"></Column>
            <Column field="room.floor.name" header="Floor Layout"></Column>
            <Column field="start_date" header="Check In"></Column>
            <Column field="end_date" header="Check Out"></Column>
            <Column field="room.price_per_night" header="Price"></Column>
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
                    <Button :disabled="slotProps.data.status === 'confirmed'" v-tooltip.top="{ value: 'Approve reservation' }" icon="pi pi-check" text class="" severity="success" rounded @click="actionOnRsrv(slotProps.data.id, 'approve')" />
                    <Button :disabled="slotProps.data.status === 'pending'"  v-tooltip.top="{ value: 'Hold reservation' }" icon="pi pi-undo" text class="" severity="secondary" rounded @click="actionOnRsrv(slotProps.data.id, 'hold')" />
                    <Button :disabled="slotProps.data.status === 'cancelled'" v-tooltip.top="{ value: 'Cancel reservation' }" icon="pi pi-times" text severity="danger" rounded @click="actionOnRsrv(slotProps.data.id, 'cancel')"/>

                </template>
            </Column>
            <!-- <template #footer> In total there are {{ reservationsList ? reservationsList.length : 0 }} rows. </template> -->
        </DataTable>

        <!-- Create -->
        <Dialog v-model:visible="visibleCreateTag" modal header="Create Tag" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <TagsCreateTag @closeCreateModal="closeCreateModal($event)" />
        </Dialog>

        <!-- Edit -->
        <Dialog v-model:visible="visibleEditTag" modal header="Edit Tag" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <TagsEditTag :param="{ id, name }" @closeEditModal="closeEditModal($event)" />
        </Dialog>

        <Dialog v-model:visible="visibleDeleteTag" header=" " dismissableMask="true" :style="{ width: '25rem' }">
            <p>Are you sure you want to <span> <b>{{actionModalMsg}}</b> </span> this reservation?</p>
            <Button label="No" icon="pi pi-times" text @click="visibleDeleteTag = false" />
            <Button label="Yes" icon="pi pi-check" text @click="confirmDeleteTag" :loading="loading1" />
        </Dialog>

        <!-- Invite User -->
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
