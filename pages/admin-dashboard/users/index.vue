<script setup>
definePageMeta({
    
    layout: 'default'
});
const url = useRuntimeConfig();
import { FilterMatchMode } from 'primevue/api';

import Column from 'primevue/column';

import DataTable from 'primevue/datatable';


const filters = ref();

const loading = ref(true);
const loading1 = ref(false);

const toast = useToast();

import Dialog from 'primevue/dialog';

const visibleCreateUser = ref(false);


const visibleEditUser = ref(false);

const usersLists = ref([]);

const visibleDeleteEmployee = ref(false);

const id = ref('');

const name = ref('');

const email = ref('');

const phone = ref('');

const address = ref('');

const rolesLists = ref([]);

const user_type = ref([]);

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


const closeInviteModal = (evn) => {
    visibleInviteUser.value = false;
    init();
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
    user_type.value = data.user_type;
    employeeId.value = data.employee_id;
    rolesLists.value.map((item) => {
        if (item.name === data.user_type) {
            user_type.value = item;
        }
    });
};

const deleteEmployee = (key) => {
    visibleDeleteEmployee.value = true;
    id.value = key;
};

const confirmDeleteEmployee = async () => {
    loading1.value = true;
    const token = useCookie('token');
    const { data, pending } = await useFetch(`${url.public.apiUrl}/users/delete/${id.value}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token.value}`
        }
    });

    if (data.value.code === 200) {
        visibleDeleteEmployee.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: 'Employee Deleted successfully!', group: 'br', life: 3000 });
        loading1.value = false;
        init();
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Employee Deleted Failed!', group: 'br', life: 3000 });
        loading1.value = false;
    }

};

const userI = ref();


const changeAttribute = async () => {
    userI.value = selectedRoles.value ? selectedRoles.value.map((item) => item.id) : '';
    init(userI.value);
}

const init = async (userTypes) => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('taskAssignModalData', () =>
        $fetch(`${url.public.apiUrl}/users/list${userTypes ? `?role_id=${userTypes}` : ''}`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.data?.length > 0) {
        usersLists.value = data.value?.data.map((item, index) => ({ ...item, index: index + 1 }));
    }
};

const getRoleList = async () => {
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('roleLiist', () =>
        $fetch(`${url.public.apiUrl}/roles/list`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.data?.length > 0) {
        // console.log('data', data.value?.data);
        rolesLists.value = data.value?.data.map((item, index) => ({ ...item, index: index + 1 }));
        filterRoles.value = data.value?.data.map((item) => ({ name: item.name, id: item.id }));
        console.log('rolesLists', rolesLists.value);
    }
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const rolePermission = useCookie('rolePermission');


onMounted(() => {
    init();
    getRoleList();
    loading.value = false;
});

initFilters();

const downloadTaskSheet = () => {
    if (usersLists.value.length > 0) {
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            '"Serial No.","Employee Name","Email","Phone","Address","User Type",\n' +
            usersLists.value.map((task, index) => {
                    const serialNo = index + 1;
                    const employeeName = task.name;
                    const email = task.email;
                    const phone = task.phone;
                    const address = task.address;
                    const userType = task.user_type;

                    return `"${serialNo}","${employeeName}","${email}","${phone}","${address}","${userType}"`;
                })
                .join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'tasks.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);    
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No data found to download', group: 'br', life: 3000 });
    }
};

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
                <Button icon="pi pi-plus" label="Create" @click="handleCreateUserModal" class="mr-2" severity="secondary"/>
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

        <DataTable v-model:filters="filters" class="table-st" :value="usersLists" stripedRows paginator :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem" :rows="10" dataKey="id" filterDisplay="menu" :loading="loading">
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
            <Column field="user_type" header="User Type"></Column>
            <Column field="action" header="Action">
                <template #body="slotProps">
                    <Button  icon="pi pi-pencil" text class="mr-2" severity="success" rounded @click="editUser(slotProps.data)" />
                    <Button  icon="pi pi-trash" text class="" severity="warning" rounded @click="deleteEmployee(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <!-- Create -->
        <Dialog v-model:visible="visibleCreateUser" modal header="Create Employee" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <CreateEmployee :param="{ rolesLists }" @closeCreateModal="closeCreateModal($event)" />
        </Dialog>

        <!-- Edit -->
        <Dialog v-model:visible="visibleEditUser" modal header="Edit Employee" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <editUser :param="{ id, name, address, phone, email, user_type, employeeId, rolesLists }" @closeEditModal="closeEditModal($event)" />
        </Dialog>

        <Dialog v-model:visible="visibleDeleteEmployee" header=" " :style="{ width: '25rem' }" dismissableMask="true">
            <p>Are you sure you want to delete?</p>
            <Button label="No" icon="pi pi-times" text @click="visibleDeleteEmployee = false" />
            <Button label="Yes" icon="pi pi-check" text @click="confirmDeleteEmployee" :loading="loading1"/>
        </Dialog>

        <!-- Invite User -->
        <Dialog v-model:visible="visibleInviteUser" modal header="Invite Employee" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <InviteGuest :param="{ rolesLists }" @closeInviteModal="closeInviteModal($event)" />
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

.filtr{
    max-width: 200px !important;
    min-width: 200px !important;
}
</style>
