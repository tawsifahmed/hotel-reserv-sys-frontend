<script setup>
import accessPermission from '~/composables/userTypeChecker';

const url = useRuntimeConfig();
definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

const isAdmin = ref(accessPermission('admin'));

import { FilterMatchMode } from 'primevue/api';

import Column from 'primevue/column';

import DataTable from 'primevue/datatable';

const filters = ref();

const loading = ref(true);
const loading1 = ref(false);

const toast = useToast();

const visibleCreateTag = ref(false);

const visibleEditTag = ref(false);

const tagsLists = ref([]);

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
    visibleEditTag.value = true;
    id.value = data.id;
    name.value = data.name;
    email.value = data.email;
    phone.value = data.phone;
    address.value = data.address;
};

const deleteTag = (key) => {
    visibleDeleteTag.value = true;
    id.value = key;
};

const confirmDeleteTag = async () => {
    loading1.value = true;
    const token = useCookie('token');
    const { data, pending } = await useFetch(`${url.public.apiUrl}/tag/delete/${id.value}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token.value}`
        }
    });

    if (data.value.code === 200) {
        visibleDeleteTag.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Tag Deleted successfully!', group: 'br', life: 3000 });
        loading1.value = false;
        init();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Tag Deleted Failed!', group: 'br', life: 3000 });
        loading1.value = false;
    }
};

const init = async () => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('tagsList', () =>
        $fetch(`${url.public.apiUrl}/tag/list`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.data?.length > 0) {
        tagsLists.value = data.value?.data.map((item, index) => ({ ...item, index: index + 1 }));
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

        <DataTable v-model:filters="filters" class="table-st" :value="tagsLists" stripedRows paginator tableStyle="min-width: 50rem" :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" dataKey="id" filterDisplay="menu" :loading="loading">
            <template #empty> <p class="text-center">No Data found...</p> </template>
            <template #loading> <ProgressSpinner style="width: 50px; height: 50px" /> </template>
            <Column field="index" header="Serial" sortable></Column>

            <Column field="name" header="Room No"></Column>
            <Column field="name" header="Booked By"></Column>
            <Column field="email" sortable header="Check In"></Column>
            <Column field="phone" sortable header="Check Out"></Column>
            <Column field="phone" sortable header="Status"></Column>
            <Column field="action" header="Action">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" text class="" severity="success" rounded @click="editTag(slotProps.data)" />
                    <Button icon="pi pi-pencil" text class="" severity="success" rounded style="visibility: hidden" />
                </template>
            </Column>
            <!-- <template #footer> In total there are {{ tagsLists ? tagsLists.length : 0 }} rows. </template> -->
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
            <p>Are you sure you want to delete?</p>
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
