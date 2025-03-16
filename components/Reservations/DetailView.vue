<script setup>
const url = useRuntimeConfig();
const { resSingleData } = defineProps(['resSingleData']);

const selectedStatus = ref({
    name: resSingleData.status.charAt(0).toUpperCase() + resSingleData.status.slice(1),
    code: resSingleData.status
});

const statusList = ref([
    { name: 'Pending', code: 'pending' },
    // { name: 'Confirmed', code: 'confirmed' },
    { name: 'Cancelled', code: 'cancelled' },
])
const toast = useToast();

const errorHandler = ref(false);

const emit = defineEmits(['closeCreateModal']);

const loading = ref(false);
const handleSubmitData = async () => {
    loading.value = true;
    if (!errorHandler.value) {
        const token = useCookie('token');
        const { data, error, pending } = await useFetch(`${url.public.apiUrl}/api/v1/reservations/store`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token.value}`
            },
            body: {
                // room_id: bookingData.value.room_id,
                // start_date: bookingData.value.start_date,
                // end_date: bookingData.value.end_date,
                // total_price: 200
                // is_paid
            }
        });

        if (data.value.code === 201) {
            loading.value = false;
            emit('closeCreateModal', false);
            await toast.add({ severity: 'success', summary: 'Success', detail: 'Booking created successfully!', group: 'br', life: 3000 });
            setTimeout(() => {
                navigateTo({ path: `/my-bookings/` });
            }, 2000);
        } else {
            loading.value = false;
            toast.add({ severity: 'error', summary: 'Error', detail: 'Booking creation failed!', group: 'br', life: 3000 });
        }
    }
};
</script>
<template>
    <div>
        <pre>        {{ resSingleData }} </pre>
        <div class="field">
            <label>Room No.<i class="text-red-400 text-italic"></i> </label>
            <InputText v-model="resSingleData.room.name" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Check In<i class="text-red-400"></i> </label>
            <InputText v-model="resSingleData.start_date" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Check Out<i class="text-red-400"></i> </label>
            <InputText v-model="resSingleData.end_date" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Price per day<i class="text-red-400 text-italic"></i> </label>
            <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputNumber v-model="resSingleData.room.price_per_night" disabled placeholder="Price" />
            </InputGroup>
        </div>
        <div class="field">
            <label>Total Price <i class="text-red-700 text-italic text-xs">Calculated from date range</i> </label>
            <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputNumber  disabled placeholder="Price" />
            </InputGroup>
        </div>
        <div class="mt-2 mb-3" style="border: 1px solid #e0e0e0; margin-top: 20px; padding: 15px; border-radius: 5px">
            <label class="my-2 text-xl font-bold">Customer Details<i class="text-red-400 text-italic"></i> </label>
            <div class="field mt-2">
                <label>Name<i class="text-red-400 text-italic"></i> </label>
                <InputText  class="w-full" disabled />
            </div>
            <div class="field">
                <label>Email<i class="text-red-400 text-italic"></i> </label>
                <InputText  class="w-full" disabled />
            </div>
        </div>
        <div class="user-selection w-full md:w-14rem w-full">
            <label class="font-bold block mb-2">Booking Status:</label>
            <div class="flex justify-content-center">
                <Dropdown display="chip" v-model="selectedStatus" :options="statusList" filter resetFilterOnHide optionLabel="name" placeholder="Select Status (Optional)" class="w-full" />
            </div>
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
