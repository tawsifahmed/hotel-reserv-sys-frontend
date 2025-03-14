<script setup>
import accessPermission from '~/composables/userTypeChecker';

import { storeToRefs } from 'pinia';
import RadioButton from 'primevue/radiobutton';

const url = useRuntimeConfig();
definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

const isAdmin = ref(accessPermission('admin'));
if(isAdmin.value === false){
  throw createError({statusCode: 404, message: 'Access denied!', fatal: true})
}

const startDate = ref('');

const endDate = ref('');
const selectedStatus = ref();
const loading = ref(false);
const loading1 = ref(false);
const toast = useToast();
const statusList = ref([
    { name: 'Pending', code: 'pending' },
    { name: 'Approved', code: 'confirmed' },
    { name: 'Cancelled', code: 'cancelled' },
])
// Date Formatter
const dateFormatter = (data) => {
    const dateStr = data;
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const handleReportDownload = async () => {
    const token = useCookie('token');
    loading1.value = true;
    if ((startDate.value && !endDate.value) || (!startDate.value && endDate.value)) {
        loading.value = false;
        return toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please Select Both Dates', group: 'br', life: 3000 });
    }
    const formattedStartDate = dateFormatter(startDate.value);
    const formattedEndDate = dateFormatter(endDate.value);

    const { data, error } = await useFetch(`${url.public.apiUrl}/api/v1/reservations/export-excel${startDate.value ? `?start_date=${formattedStartDate}` : ''}${endDate.value ? `${startDate.value ? '&' : '?'}end_date=${formattedEndDate}` : ''}${selectedStatus.value ? `${startDate.value || endDate.value ? '&' : '?'}status=${selectedStatus.value.code}` : ''}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token.value}`
        },
        // body: formData
    });
    if (error.value) {
        console.log(error);
        return (loading1.value = false);
    }
    if (data.value.code == 200) {
        const link = document.createElement('a');
        link.href = data.value.download_path;
        link.target = '_blank';
        link.click();
        return (loading1.value = false);
    } else {
        loading1.value = false;
        return toast.add({ severity: 'error', summary: 'Failed', detail: 'Failed to download', group: 'br', life: 3000 });
    }
};

const handleChange = (field, event) => {
    const date = new Date(event);
    if (field == 'startDate') {
        startDate.value = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    } else {
        endDate.value = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }
};

onMounted(() => {
    // init();
    if (isAdmin.value === false) {
        throw createError({ statusCode: 404, message: 'Access denied!', fatal: true });
    }
});

const handleReset = () => {
    startDate.value = '';
    endDate.value = '';
    selectedStatus.value = [];
};
</script>
<template>
    <div class="card">
        <!-- <pre>{{ usersListStore }}</pre> -->
        <Toast position="bottom-right" group="br" />
        <div class="d-flex mr-2">
            <h5 class="mb-1">Reports 
                <span v-tooltip.right="{ value: 'If you are running the backend in local, use--- ```php artisan storage:link``` for the first time.' }" class="pi pi-info-circle cursor-pointer text-red-500 text-lg instruction-tip"></span>
            </h5>
            <!-- <pre>
                sp =>{{  selectedStatus?.length }}
            
            </pre> -->
        </div>
        <Toolbar class="border-0 px-0">
            <template #start>
                <div class="flex gap-2 flex-wrap">
                    <div class="user-selection w-full md:w-14rem w-full">
                        <label class="font-bold block mb-2">Booking Status:</label>
                        <div class="flex justify-content-center">
                            <Dropdown display="chip" v-model="selectedStatus" :options="statusList" filter resetFilterOnHide optionLabel="name" placeholder="Select Status (Optional)" class="w-full" />
                        </div>
                    </div>
                    <div class="flex-auto">
                        <label for="icondisplay" class="font-bold block mb-2">From: </label>
                        <Calendar v-model="startDate" @date-select="handleChange('startDate', $event)" clearButton="true" showIcon iconDisplay="input" inputId="icondisplay" />
                    </div>
                    <div class="flex-auto">
                        <label for="icondisplay" class="font-bold block mb-2">To: </label>
                        <Calendar v-model="endDate" @date-select="handleChange('endtDate', $event)" clearButton showIcon iconDisplay="input" inputId="icondisplay" />
                    </div>
                </div>
            </template>

            <template #end>
                <Button @click="handleReset" label='Reset' class="mr-2" />
                <Button @click="handleReportDownload" class="" label="Generate" :loading="loading" />
            </template>
        </Toolbar>
    </div>
</template>

<style lang="scss" scoped>
.user-selection {
    display: flex;
    flex-direction: column;
    // gap: 2px;
}
</style>
