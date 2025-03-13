<script setup>
import accessPermission from '~/composables/userTypeChecker';

definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

const isAdmin = ref(accessPermission('admin'));

const url = useRuntimeConfig();
import { FilterMatchMode } from 'primevue/api';

import Column from 'primevue/column';

import DataTable from 'primevue/datatable';

const filters = ref();

const loading = ref(true);
const loading1 = ref(false);

const toast = useToast();

import Dialog from 'primevue/dialog';
import { ref } from 'vue';

const visibleCreateUser = ref(false);

const visibleEditUser = ref(false);

const usersLists = ref([]);

const visibleDeleteUser = ref(false);

const id = ref('');

const name = ref('');

const email = ref('');

const phone = ref('');

const address = ref('');

const userType = ref([]);

const employeeId = ref('');

const closeCreateModal = (evn) => {
    visibleCreateUser.value = false;
    init();
};

const closeEditModal = (evn) => {
    visibleEditUser.value = false;
    init();
};

const handleCreateUserModal = () => {
    visibleCreateUser.value = true;
};

const selectedRoles = ref([]);
const filterRoles = ref([]);

const editUser = (data) => {
    visibleEditUser.value = true;
    id.value = data.id;
    name.value = data.name;
    email.value = data.email;
    phone.value = data.phone;
    address.value = data.address;
    userType.value = data.type;
    employeeId.value = data.employee_id;
    rolesLists.value.map((item) => {
        if (item.name === data.user_type) {
            user_type.value = item;
        }
    });
};

const deleteEmployee = (key) => {
    if (key === 1) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'You can not delete root user!', group: 'br', life: 3000 });
        return;
    } else {
        visibleDeleteUser.value = true;
        id.value = key;
    }
};

const confirmDeleteUser = async () => {
    loading1.value = true;
    const token = useCookie('token');
    const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/users/delete/${id.value}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token.value}`
        }
    });

    if (data.value.code === 200) {
        visibleDeleteUser.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully!', group: 'br', life: 3000 });
        loading1.value = false;
        init();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user!', group: 'br', life: 3000 });
        loading1.value = false;
    }
};

const init = async () => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('usersData', () =>
        $fetch(`${url.public.apiUrl}/api/v1/users/list`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.data?.length > 0) {
        usersLists.value = data.value?.data.map((item, index) => ({ ...item, index: index + 1 }));
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
});
initFilters();
</script>

<template>
    <div class="card">
        <div class="d-flex mr-2">
            <Toast position="bottom-right" group="br" />
            <div class="d-flex mr-2">
                <h5 class="mb-1">User List</h5>
            </div>
            <!-- <pre>{{usersLists}}</pre> -->
        </div>
        <Toolbar class="border-0 px-0">
            <template #start>
                <Button icon="pi pi-plus" label="Create" @click="handleCreateUserModal" class="mr-2" severity="secondary" />
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

        <DataTable v-model:filters="filters" class="table-st" :value="usersLists" stripedRows paginator :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem" :rows="20" dataKey="id" filterDisplay="menu" :loading="tableLoader">
            <!-- <DataTable 
            v-model:filters="filters" 
            class="table-st" 
            :value="usersLists" 
            stripedRows 
            tableStyle="min-width: 50rem" 
            :rows="10" 
            dataKey="id" 
            filterDisplay="menu" 
            :loading="loading || isLoading"

            :paginator="true"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            @page="onPage"
        > -->
            <template #empty> <p class="text-center">No Data found...</p> </template>
            <template #loading> <ProgressSpinner style="width: 50px; height: 50px" /> </template>
            <Column field="index" header="Serial" sortable></Column>
            <Column field="name" header="User Name"></Column>
            <Column field="email" header="Email Address"></Column>
            <Column field="phone" header="Phone"></Column>
            <Column field="type" header="User Type"></Column>
            <Column field="action" header="Action">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" text class="mr-2" severity="success" rounded @click="editUser(slotProps.data)" />
                    <Button icon="pi pi-trash" text class="" severity="warning" rounded @click="deleteEmployee(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <!-- Create -->
        <Dialog v-model:visible="visibleCreateUser" modal header="Create User" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <UserCreateUser :param="{ rolesLists }" @closeCreateModal="closeCreateModal($event)" />
        </Dialog>

        <!-- Edit ------->
        <Dialog v-model:visible="visibleEditUser" modal header="Edit User" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <UserEditUser :param="{ id, name, address, phone, email, userType }" @closeEditModal="closeEditModal($event)" />
        </Dialog>

        <Dialog v-model:visible="visibleDeleteUser" header=" " :style="{ width: '25rem' }" dismissableMask="true">
            <p>Are you sure you want to delete?</p>
            <Button label="No" icon="pi pi-times" text @click="visibleDeleteUser = false" />
            <Button label="Yes" icon="pi pi-check" text @click="confirmDeleteUser" :loading="loading1" />
        </Dialog>
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

.excel-export-btn {
    background: #f1f5f9;
    border: 1px solid #f1f5f9;
    text-decoration: none;
    padding: 0.2rem 1rem !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

.excel-export-btn img {
    width: 21px;
    height: 20px;
}

.excel-export-btn:hover {
    background: #e2e8f0;
    color: #334155;
    border-color: #e2e8f0;
}

.filtr {
    max-width: 200px !important;
    min-width: 200px !important;
}
</style>
