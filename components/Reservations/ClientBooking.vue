<script setup>
import { nextTick, onMounted } from 'vue';

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

const employeeForm = ref(true);

const emit = defineEmits(['closeCreateModal']);

const loading = ref(false);
const handleSubmitData = async () => {
    loading.value = true;
    if (name.value === '' || email.value === '' || password.value === '') {
        errorHandler.value = true;
        loading.value = false;
        return;
    } else {
        errorHandler.value = false;
        if (!errorHandler.value) {
            const token = useCookie('token');
            const { data, error, pending } = await useFetch(`${url.public.apiUrl}/api/v1/reservations/store`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                body: {
                    name: name.value,
                    email: email.value,
                    address: address.value,
                    phone: phone.value,
                    password: password.value,
                    password_confirmation: password.value,
                    type: 'client'
                }
            });

            if (error?.value) {
                if (error?.value?.data?.code === 422) {
                    loading.value = false;
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Email already exists!', group: 'br', life: 3000 });
                    return;
                }
            } else if (data?.value?.code === 201) {
                loading.value = false;
                name.value = null;
                email.value = null;
                phone.value = null;
                address.value = null;
                password.value = null;
                employeeForm.value = false;
                emit('closeCreateModal', false);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Employee created successfully!', group: 'br', life: 3000 });
                return;
            } else {
                loading.value = false;
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create employee!', group: 'br', life: 3000 });
                return;
            }
        }
    }
};

</script>
<template>
    <div>
        <!-- {{ bookingData }} -->
        <div class="field">
            <label
                >Name<i class="text-red-400 text-italic">*</i>
            </label>
            <InputText  v-model="bookingData.roomName" class="w-full" disabled placeholder="Room No."/>
        </div>
        <pre>pre{{bookingData}}</pre>
        <div class="field">
            <label 
                >Check In<i class="text-red-400">*</i> 
            </label>
            <InputText v-model="bookingData.start_date" class="w-full" disabled placeholder="Enter Email"/>
        </div>
        <div class="field">
            <label 
                >Check Out<i class="text-red-400">*</i> 
            </label>
            <InputText v-model="bookingData.end_date" class="w-full" disabled placeholder="Enter Email"/>
        </div>
        <div class="field">
            <label
                >Floor Layout<i class="text-red-400 text-italic">*</i>
            </label>
            <InputText  v-model="bookingData.floorName" class="w-full" disabled placeholder="Room No."/>
        </div>
        <div class="field">
            <label
                >Price<i class="text-red-400 text-italic">*</i>
            </label>
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
