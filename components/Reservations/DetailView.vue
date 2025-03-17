<script setup>
const url = useRuntimeConfig();
const { resSingleData } = defineProps(['resSingleData']);

const bookingData = ref({
    id: resSingleData?.id,
    room_id: resSingleData?.room_id,
    start_date: resSingleData?.start_date,
    end_date: resSingleData?.end_date,
    total_price: resSingleData?.total_price,
    status: resSingleData?.status,
    room: {
        name: resSingleData?.room?.name,
        price_per_night: resSingleData?.room?.price_per_night
    },
    user: {
        name: resSingleData?.user?.name,
        email: resSingleData?.user?.email
    },
    floor: {
        name: resSingleData?.room?.floor?.name,
    },
    type: resSingleData?.type
});
const selectedStatus = ref({
    name: resSingleData?.status === 'cancelled' ? 'Cancel' : resSingleData?.status === 'confirmed' ? 'Confirm' : resSingleData?.status === 'pending' ? 'Pending' : resSingleData?.status.charAt(0).toUpperCase() + resSingleData?.status?.slice(1),
    code: resSingleData?.status
});


const statusChanged = ref(false);

watch(selectedStatus, (newValue, oldValue) => {
    if (newValue.code !== oldValue.code) {
        statusChanged.value = true;
    }
});

const statusList = ref([
    
])
if(resSingleData.type === 'client' && resSingleData?.status === 'pending'){
    statusList.value.push({ name: 'Pending', code: 'pending' });
    statusList.value.push({ name: 'Cancel', code: 'cancelled' });
}else{
    statusList.value.push({ name: 'Pending', code: 'pending' });
    statusList.value.push({ name: 'Confirm', code: 'confirmed' });
    statusList.value.push({ name: 'Cancel', code: 'cancelled' });
}


const toast = useToast();

const errorHandler = ref(false);

const emit = defineEmits(['closeEditModal']);

const loading = ref(false);
const handleSubmitData = async () => {
    loading.value = true;
    if (!errorHandler.value) {
        const token = useCookie('token');
        const { data, error, pending } = await useFetch(`${url.public.apiUrl}/api/v1/reservations/update/${bookingData.value?.id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token.value}`
            },
            body: {
                
                status: selectedStatus.value.code
            }
        });

        if (data.value.code === 200) {
            loading.value = false;
            emit('closeEditModal', false);
            await toast.add({ severity: 'success', summary: 'Success', detail: 'Booking updated successfully!', group: 'br', life: 3000 });
        } else {
            loading.value = false;
            toast.add({ severity: 'error', summary: 'Error', detail: 'Booking creation failed!', group: 'br', life: 3000 });
        }
    }
};
</script>
<template>
    <div>
        <!-- <pre>        {{ bookingData }} </pre>
        <pre>        {{ selectedStatus }} </pre> -->
        <div class="field">
            <label>Room No.<i class="text-red-400 text-italic"></i> </label>
            <InputText v-model="bookingData.room.name" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Check In<i class="text-red-400"></i> </label>
            <InputText v-model="bookingData.start_date" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Check Out<i class="text-red-400"></i> </label>
            <InputText v-model="bookingData.end_date" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Price per day<i class="text-red-400 text-italic"></i> </label>
            <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputNumber v-model="bookingData.room.price_per_night" disabled placeholder="Price" />
            </InputGroup>
        </div>
        <div class="field">
            <label>Total Price <i class="text-red-700 text-italic text-xs">Calculated from date range</i> </label>
            <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputNumber v-model="bookingData.total_price" disabled placeholder="Price" />
            </InputGroup>
        </div>
        <div class="mt-2 mb-3" style="border: 1px solid #e0e0e0; margin-top: 20px; padding: 15px; border-radius: 5px">
            <label class="my-2 text-xl font-bold">Customer Details<i class="text-red-400 text-italic"></i> </label>
            <div class="field mt-2">
                <label>Name<i class="text-red-400 text-italic"></i> </label>
                <InputText v-model="bookingData.user.name" class="w-full" disabled />
            </div>
            <div class="field">
                <label>Email<i class="text-red-400 text-italic"></i> </label>
                <InputText v-model="bookingData.user.email" class="w-full" disabled />
            </div>
        </div>
        <div class="user-selection w-full flex flex-column align-items-center w-full">
            <label class="font-bold block mb-2">Booking Status:</label>
            <div class="flex justify-content-center md:w-14rem">
                <Dropdown     :disabled="(bookingData.status === 'cancelled' || bookingData.status === 'confirmed') && bookingData.type === 'client'" display="chip" v-model="selectedStatus" :options="statusList" filter resetFilterOnHide optionLabel="name" placeholder="Select Status" class="w-full" />
            </div>
        </div>
        <div class=" justify-content-center align-items-center w-full my-3">
            <p class="mb-0" v-if="(bookingData.status === 'cancelled' || bookingData.status === 'confirmed') && bookingData.type === 'client'" style="color: red; text-align:center;">Your reservation has been {{bookingData.status}}.</p>
             <p v-if="bookingData.status === 'cancelled' && bookingData.type === 'client'" style="color: red; text-align:center;"> You cannot update this reservation anymore.</p>
        </div>
        <div class="create-btn-wrapper mb-0">
            <Button :loading="loading" label="Update Reservation" @click="handleSubmitData" :disabled="!statusChanged" />
        </div>
    </div>
</template>
<style lang="scss" scoped>
.text-danger {
    color: red;
}

.create-btn-wrapper {
    display: flex;
    justify-content: end;
}

.permission_selection {
    .p-multiselect-label {
        display: flex !important;
        flex-wrap: wrap !important;
        .p-multiselect-token {
            margin: 0 5px 5px 0 !important;
        }
    }

    .p-multiselect-trigger {
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        padding-top: 11px !important;
    }
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
}
</style>
