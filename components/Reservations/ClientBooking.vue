<script setup>

const url = useRuntimeConfig();
const props = defineProps({
    param: {
        type: Object,
        required: true
    }
});
const bookingData = ref(props.param.bookingData);

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
                    room_id: bookingData.value.room_id,
                    start_date: bookingData.value.start_date,
                    end_date: bookingData.value.end_date,
                }
            });

            if(data.value.code === 201) {
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
    }

</script>
<template>
    <div>
        <!-- {{ bookingData }} -->
        <div class="field">
            <label>Name<i class="text-red-400 text-italic">*</i> </label>
            <InputText v-model="bookingData.roomName" class="w-full" disabled />
        </div>
        <!-- <pre>pre{{ bookingData }}</pre> -->
        <div class="field">
            <label>Check In<i class="text-red-400">*</i> </label>
            <InputText v-model="bookingData.start_date" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Check Out<i class="text-red-400">*</i> </label>
            <InputText v-model="bookingData.end_date" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Floor Layout<i class="text-red-400 text-italic">*</i> </label>
            <InputText v-model="bookingData.floorName" class="w-full" disabled />
        </div>
        <div class="field">
            <label>Price<i class="text-red-400 text-italic">*</i> </label>
            <InputGroup>
                <InputGroupAddon>$</InputGroupAddon>
                <InputNumber v-model="bookingData.price" disabled placeholder="Price" />
            </InputGroup>
        </div>
        <p v-if="errorHandler" style="color: red">Please fill/check up all the fields</p>
        <div class="create-btn-wrapper mb-0">
            <Button :loading="loading" label="Book" icon="pi pi-check" text="" @click="handleSubmitData" />
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
