<script setup>
import accessPermission from '~/composables/userTypeChecker';
import { useFloorStore } from '~/store/floors';
import { storeToRefs } from 'pinia'; 
import { FilterMatchMode } from 'primevue/api';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';

const { getFloors } = useFloorStore();
const { floorList } = storeToRefs(useFloorStore());
const url = useRuntimeConfig();
const isAdmin = ref(accessPermission('admin'));
const toast = useToast();
definePageMeta({
    middleware: 'auth',
    layout: 'default'
});


const filters = ref();
const loading = ref(true);
const loading1 = ref(false);

const roomsList = ref([]);
const visibleCreateRoom = ref(false);
const visibleEditRoom = ref(false);
const visibleDeleteRoom = ref(false);

const roomId = ref('');
const roomNo = ref('');
const seatNo = ref('');
const roomPrice = ref('');
const floorLayout = ref('');

const closeCreateModal = (evn) => {
    visibleCreateRoom.value = false;
    init();
};

const closeEditModal = (evn) => {
    visibleEditRoom.value = false;
    init();
};

const handleCreateTagModal = () => {
    visibleCreateRoom.value = true;
    init();
};

const editRoom = (data) => {
    console.log(data);
    visibleEditRoom.value = true;
    roomId.value = data?.id;
    roomNo.value = data?.name;
    seatNo.value = data?.seats;
    floorLayout.value = data?.floor;
    roomPrice.value = data?.price_per_night;
};

const deleteRoom = (key) => {
    visibleDeleteRoom.value = true;
    roomId.value = key;
};

const roomsLength = ref(null);
const init = async () => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('roomList', () =>
        $fetch(`${url.public.apiUrl}/api/v1/rooms`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.length > 0) {
        roomsList.value = data.value?.map((item, index) => ({ ...item, index: index + 1 }));
        if (roomsList.value.length === 1) {
                roomsLength.value = 1;
                
            }else{
                roomsLength.value = null;
            }
    }
};


const confirmDeleteRoom = async () => {
    loading1.value = true;
    const token = useCookie('token');
    const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/rooms/delete/${roomId.value}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token.value}`
        }
    });
    
    if (data.value?.code === 200) {
        visibleDeleteRoom.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Room deleted successfully!', group: 'br', life: 3000 });
        loading1.value = false;
        if (roomsLength.value === 1) {
            location.reload();
        }
        init();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete!', group: 'br', life: 3000 });
        loading1.value = false;
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
const tableLoader = ref(true);
onMounted(async() => {
    if (isAdmin.value === false) {
        throw createError({ statusCode: 404, message: 'Access denied!', fatal: true });
    }
    await init();
    tableLoader.value = false;
    loading.value = false;
    getFloors();
});

initFilters();
</script>

<template>
    <div class="card">
        <div class="d-flex mr-2">
            <h5 class="mb-1">Room List</h5>
        </div>
        <Toolbar class="border-0 px-0">
            <template #start>
                <Button icon="pi pi-plus" label="Create" @click="handleCreateTagModal" class="mr-2" severity="secondary" />
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
        <!-- <pre>        {{roomsList}}
        </pre> -->
        <DataTable v-model:filters="filters" class="table-st" :value="roomsList" stripedRows paginator tableStyle="min-width: 50rem" :rows="20" :rowsPerPageOptions="[5, 10, 20, 50]" dataKey="id" filterDisplay="menu" :loading="tableLoader">
            <template #empty> <p class="text-center">No Data found...</p> </template>
            <template #loading> <ProgressSpinner style="width: 50px; height: 50px" /> </template>
            <Column field="index" header="Serial" sortable></Column>

            <Column field="name" header="Room No."></Column>
            <Column field="floor.name" header="Floor Layout"></Column>
            <Column field="seats" header="Seat Capacity"></Column>
            <Column field="price_per_night" header="Price">
                <template #body="slotProps"> 
                <i>
                    <b>
                        $
                    </b>
                    {{ slotProps.data.price_per_night }}
                </i>    
                </template>
            </Column>
            <Column field="action" header="Action">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" text class="" severity="success" rounded @click="editRoom(slotProps.data)" />
                    <Button icon="pi pi-trash" text class="" severity="warning" rounded @click="deleteRoom(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <!-- Create -->
        <Dialog v-model:visible="visibleCreateRoom" modal header="Create Room" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <RoomsCreateRoom :param="{floorList}" @closeCreateModal="closeCreateModal($event)" />
        </Dialog>

        <!-- Edit -->
        <Dialog v-model:visible="visibleEditRoom" modal header="Edit Room" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <RoomsEditRoom :param="{ roomId, roomNo, seatNo, roomPrice, floorList, floorLayout }" @closeEditModal="closeEditModal($event)" />
        </Dialog>

        <Dialog v-model:visible="visibleDeleteRoom" header=" " dismissableMask="true" :style="{ width: '25rem' }">
            <p>Are you sure you want to delete?</p>
            <Button label="No" icon="pi pi-times" text @click="visibleDeleteRoom = false" />
            <Button label="Yes" icon="pi pi-check" text @click="confirmDeleteRoom" :loading="loading1" />
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
