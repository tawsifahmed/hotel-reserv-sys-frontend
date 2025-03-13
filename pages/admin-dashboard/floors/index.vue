<script setup>
import { useFloorStore } from '~/store/floors';
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import accessPermission from '~/composables/userTypeChecker';
import { FilterMatchMode } from 'primevue/api';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable'
const { getFloors } = useFloorStore();
const { floorList, floorsLength } = storeToRefs(useFloorStore());

const url = useRuntimeConfig();
definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

const floorListwithIndex = computed(() => {
    return floorList.value.map((item, index) => {
        return { ...item, index: index + 1 };
    });
});

const isAdmin = ref(accessPermission('admin'));
const filters = ref();

const loading = ref(true);
const loading1 = ref(false);

const toast = useToast();

const visibleCreateFloor = ref(false);

const visibleEditFloor = ref(false);

const tagsLists = ref([]);

const visibleDeleteFloor = ref(false);

const id = ref('');

const name = ref('');

const email = ref('');

const phone = ref('');

const address = ref('');

const closeCreateModal = (evn) => {
    visibleCreateFloor.value = false;
    getFloors();
};

const closeEditModal = (evn) => {
    visibleEditFloor.value = false;
    getFloors();
};

const handleCreateFloorModal = () => {
    visibleCreateFloor.value = true;
    getFloors();
};

const editFloor = (data) => {
    visibleEditFloor.value = true;
    id.value = data.id;
    name.value = data.name;
};

const deleteFloor = (key) => {
    visibleDeleteFloor.value = true;
    id.value = key;
};

const confirmDeleteFloor = async () => {
    loading1.value = true;
    const token = useCookie('token');
    const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/floors/delete/${id.value}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token.value}`
        }
    });

    if (data.value.code === 200) {
        visibleDeleteFloor.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Floor deleted successfully!', group: 'br', life: 3000 });
        loading1.value = false;
        if (floorsLength.value === 1) {
            location.reload();
        }
        getFloors();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Floor deleted Failed!', group: 'br', life: 3000 });
        loading1.value = false;
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode?.CONTAINS }
    };
};

getFloors();
onMounted(() => {
    loading.value = false;
    if (isAdmin.value === false) {
        throw createError({ statusCode: 404, message: 'Access denied!', fatal: true });
    }
});
initFilters();
</script>

<template>
    <div class="card">
        <div class="d-flex mr-2">
            <h5 class="mb-1">Floor List</h5>
        </div>
        <Toolbar class="border-0 px-0">
            <template #start>
                <Button icon="pi pi-plus" label="Create" @click="handleCreateFloorModal" class="mr-2" severity="secondary" />
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

        <DataTable v-model:filters="filters" class="table-st" :value="floorListwithIndex" stripedRows paginator tableStyle="min-width: 50rem" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" dataKey="id" filterDisplay="menu" :loading="loading">
            <template #empty> <p class="text-center">No Data found...</p> </template>
            <template #loading> <ProgressSpinner style="width: 50px; height: 50px" /> </template>
            <Column field="index" header="Serial" sortable></Column>

            <Column field="name" header="Floor Layout Name"></Column>
            <!-- <Column field="email" sortable header="Email Address"></Column> -->
            <!-- <Column field="phone" sortable header="Phone Number"></Column> -->
            <Column field="action" header="Action">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" text class="" severity="success" rounded @click="editFloor(slotProps.data)" />
                    <Button icon="pi pi-trash" text class="" severity="warning" rounded @click="deleteFloor(slotProps.data.id)" />
                </template>
            </Column>
            <!-- <template #footer> In total there are {{ tagsLists ? tagsLists.length : 0 }} rows. </template> -->
        </DataTable>

        <!-- Create -->
        <Dialog v-model:visible="visibleCreateFloor" modal header="Create Floor" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <FloorsCreateFloor @closeCreateModal="closeCreateModal($event)" />
        </Dialog>

        <!-- Edit -->
        <Dialog v-model:visible="visibleEditFloor" modal header="Edit Floor" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <FloorsEditFloor :param="{ id, name }" @closeEditModal="closeEditModal($event)" />
        </Dialog>

        <Dialog v-model:visible="visibleDeleteFloor" header=" " dismissableMask="true" :style="{ width: '25rem' }">
            <p>Are you sure you want to delete?</p>
            <Button label="No" icon="pi pi-times" text @click="visibleDeleteFloor = false" />
            <Button label="Yes" icon="pi pi-check" text @click="confirmDeleteFloor" :loading="loading1" />
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
