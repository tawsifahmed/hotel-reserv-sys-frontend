<script setup>
const url = useRuntimeConfig();
const props = defineProps({
    param: {
        type: Object,
        required: true
    }
});
const toast = useToast();

const id = ref(props.param?.id);

const name = ref(props.param?.name);

const email = ref(props.param?.email);

const phone = ref(props.param?.phone);

const address = ref(props.param?.address);

const userType = ref(props.param?.userType);
const selectedUserType = ref({ name: userType.value, code: userType.value });

const typeList = ref([
    { name: 'admin', code: 'admin' },
    { name: 'client', code: 'client' },
]);
const errorHandler = ref(false);

const employeeForm = ref(true);

const emit = defineEmits(['closeEditModal']);

const loading = ref(false);

const handleSubmitData = async () => {
    loading.value = true;
    if (name.value?.trim() === '' || email.value === '') {
        errorHandler.value = true;
        loading.value = false;
        return;
    } else {
        errorHandler.value = false;
        if (!errorHandler.value) {
            const token = useCookie('token');
            const { data, error, pending } = await useFetch(`${url.public.apiUrl}/api/v1/users/update/${id.value}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                body: {
                    name: name.value,
                    email: email.value,
                    address: address.value,
                    phone: phone.value,
                    type: selectedUserType.value.code,
                    // role: user_type.value.name
                }
            });

            if (error?.value) {
                if (error?.value?.data?.code === 500) {
                    loading.value = false;
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Email already exists!', group: 'br', life: 3000 });
                    return;
                }
            } else if (data?.value?.code === 200) {
                loading.value = false;
                employeeForm.value = false;
                emit('closeEditModal', false);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Employee Updated successfully!', group: 'br', life: 3000 });
                return;
            } else {
                loading.value = false;
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update employee!', group: 'br', life: 3000 });
                return;
            }
        }
    }
};

onMounted(() => {
    const editEmployeeName = document.getElementById('editEmployeeName');
    nextTick(() => {
        if (editEmployeeName){
            editEmployeeName.focus();
        }
    });
});
</script>

<template>
    <div>
        <!-- {{ props.param.userType }} -->
        <div class="field">
            <label for="company">Name<i class="text-red-500">*</i></label>
            <InputText id="editEmployeeName" v-model="name" class="w-full" placeholder="Enter Name"/>
        </div>

        <div class="field">
            <label for="email">Email address<i class="text-red-500">*</i></label>
            <InputText type="email" v-model="email" class="w-full" :disabled="id === 1" placeholder="Enter Email"/>
        </div>
        <div class="field">
            <label for="worktype">Phone</label>
            <InputText v-model="phone" type="tel" class="w-full" placeholder="Enter Phone No."/>
        </div>
        <div class="field">
            <label for="company">Address</label>
            <Textarea v-model="address" rows="3" cols="20" class="w-full" placeholder="Enter Address"/>
        </div>
        <div class="field flex flex-column">
            <label>Role<i class="text-red-500">*</i></label>
            <Dropdown v-model="selectedUserType" :disabled="id === 1" :options="typeList" filter resetFilterOnHide optionLabel="name" placeholder="Select Role" checkmark :highlightOnSelect="false" class="w-full" />
        </div>
        <p v-if="errorHandler" style="color: red">Please fill/check up all the fields</p>
        <div class="create-btn-wrappe">
            <Button label="Update" icon="pi pi-check" text="" @click="handleSubmitData" :loading="loading" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.text-danger {
    color: red;
}

.create-btn-wrappe {
    display: flex;
    justify-content: end;
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
