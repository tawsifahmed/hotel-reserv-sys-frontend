<script setup>
const url = useRuntimeConfig();
const toast = useToast();
const emit = defineEmits(['closeCreateModal']);
const props = defineProps({
    param: {
        type: Object,
        required: true
    }
});
const visibleFinalConfirm = ref(false);
const bookingData = ref(props.param.bookingData);
const dateDuration = ref(0);
const totalPrice = ref();
const getDateCountLength = () => {
    const date1 = new Date(bookingData.value.start_date);
    const date2 = new Date(bookingData.value.end_date);
    const diffTime = date2 - date1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    dateDuration.value = diffDays;
    totalPrice.value = diffDays * bookingData.value.price;
};
getDateCountLength();

const loading = ref(false);
const handleSubmitData = async () => {
    loading.value = true;
    const token = useCookie('token');
    const { data, error, pending } = await useFetch(`${url.public.apiUrl}/api/v1/reservations/store`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token.value}`
        },
        body: {
            room_id: bookingData.value.room_id,
            start_date: bookingData.value.start_date,
            end_date: bookingData.value.end_date,
            total_price: totalPrice.value
        }
    });

    if (data.value?.code === 201) {
        loading.value = false;
        emit('closeCreateModal', false);
        await toast.add({ severity: 'success', summary: 'Success', detail: 'Booking created successfully!', group: 'br', life: 3000 });
        setTimeout(() => {
            navigateTo({ path: `/my-bookings` });
        }, 2000);
    } else {
        loading.value = false;
        toast.add({ severity: 'error', summary: 'Error', detail: 'Booking creation failed!', group: 'br', life: 3000 });
    }
};
</script>
<template>
    <div>
        <!-- <pre>        {{ dateDuration }}</pre> -->
        <div class="field">
            <label>Room No.<i class="text-red-400 text-italic"></i> </label>
            <InputText v-model="bookingData.roomName" class="w-full" disabled />
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
            <label>Floor Layout<i class="text-red-400 text-italic"></i> </label>
            <InputText v-model="bookingData.floorName" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Price per day<i class="text-red-400 text-italic"></i> </label>
            <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputNumber v-model="bookingData.price" disabled placeholder="Price" />
            </InputGroup>
        </div>
        <div class="field">
            <label>Total Price <i class="text-red-700 text-italic text-xs">Calculated from date range</i> </label>
            <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputNumber v-model="totalPrice" disabled placeholder="Price" />
            </InputGroup>
        </div>
        <div class="mt-2 mb-3" style="border: 1px solid #e0e0e0; margin-top: 20px; padding: 15px; border-radius: 5px">
            <label class="my-2 text-xl font-bold">Customer Details<i class="text-red-400 text-italic"></i> </label>
            <div class="field mt-2">
                <label>Name<i class="text-red-400 text-italic"></i> </label>
                <InputText v-model="bookingData.userData.data.name" class="w-full" disabled />
            </div>
            <div class="field">
                <label>Email<i class="text-red-400 text-italic"></i> </label>
                <InputText v-model="bookingData.userData.data.email" class="w-full" disabled />
            </div>
        </div>
        <div class="create-btn-wrapper mb-0">
            <Button label="Confirm Reservation" @click="visibleFinalConfirm = true" />
        </div>

        <Dialog v-model:visible="visibleFinalConfirm" header="Confirm Reservation" modal dismissableMask="true" :style="{ width: '25rem' }">
            <p>Are you sure you want to confirm?</p>
            <Button label="No" icon="pi pi-times" text @click="visibleFinalConfirm = false" />
            <Button label="Yes" icon="pi pi-check" text @click="handleSubmitData" :loading="loading" />
        </Dialog>
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
