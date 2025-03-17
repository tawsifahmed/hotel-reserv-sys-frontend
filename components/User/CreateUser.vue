<script setup>
import { nextTick, onMounted } from 'vue';

const emit = defineEmits(['closeCreateModal']);
const url = useRuntimeConfig();
const props = defineProps({
    param: {
        type: Object,
        required: true
    }
});
const toast = useToast();

const name = ref('');
const email = ref('');
const phone = ref('');
const address = ref('');
const password = ref('');
const errorHandler = ref(false);


const loading = ref(false);
const handleSubmitData = async () => {
    loading.value = true;
    if (name.value.trim() === '' || email.value === '' || password.value === '') {
        errorHandler.value = true;
        loading.value = false;
        return;
    } else {
        errorHandler.value = false;
        if (!errorHandler.value) {
            const token = useCookie('token');
            const { data, error, pending } = await useFetch(`${url.public.apiUrl}/api/v1/users/create`, {
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
                    toast.add({ severity: 'error', summary: 'Error', detail: `${error?.value?.data?.errors?.email}`, group: 'br', life: 3000 });
                    return;
                }
            } else if (data?.value?.code === 201) {
                loading.value = false;
                name.value = null;
                email.value = null;
                phone.value = null;
                address.value = null;
                password.value = null;
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

onMounted(() => {
    const createEmployeeName = document.getElementById('createEmployeeName');
    nextTick(() => {
        if (createEmployeeName){
            createEmployeeName.focus();
        }
    });
});
</script>
<template>
    <div>
        <div class="field">
            <label for="company"
                >Name<i class="text-red-400 text-italic">*</i>
            </label>
            <InputText id="createEmployeeName" v-model="name" class="w-full" placeholder="Enter Name"/>
        </div>

        <div class="field">
            <label for="email"
                >Email address<i class="text-red-400">*</i> 
            </label>
            <InputText type="email" v-model="email" class="w-full" placeholder="Enter Email" required/>
        </div>
        <div class="field">
            <label for="phoneNo">Phone 
            </label>
            <InputText v-model="phone" inputId="worktype" type="tel" class="w-full" maxlength="14" placeholder="Enter Phone No."/>
        </div>
        <div class="field">
            <label for="company">Address 
            </label>
            <Textarea v-model="address" rows="3" cols="20" class="w-full" placeholder="Enter Address"/>
        </div>
        <div class="field">
            <label for="company"
                >Password<i class="text-red-400">*</i> 
            </label>
            <Password v-model="password" placeholder="Enter password" :feedback="false" :invalid="confirmPassError" toggleMask class="w-full" inputClass="w-full"></Password>
        </div>
        <p v-if="errorHandler" style="color: red">Please fill/check up all the fields</p>
        <div class="create-btn-wrapper mb-0">
            <Button :loading="loading" label="Save" icon="pi pi-check" text="" @click="handleSubmitData" />
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
