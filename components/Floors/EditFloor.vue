<script setup>
const url = useRuntimeConfig();
const props = defineProps({
    param: {
        type: Object,
        required: true
    }
});
const toast = useToast();

const id = ref(props.param.id);

const name = ref(props.param.name);

const errorHandler = ref(false);

const employeeForm = ref(true);

const emit = defineEmits(['closeEditModal']);

const handleSubmitData = async () => {
    if (name.value === '') {
        errorHandler.value = true;
        return;
    } else {
        errorHandler.value = false;
        if (!errorHandler.value) {
            const token = useCookie('token');
            const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/floors/update/${id.value}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                body: {
                    name: name.value
                }
            });

            if (data.value.code === 200) {
                employeeForm.value = false;
                emit('closeEditModal', false);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Floor updated successfully!', group: 'br', life: 3000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Floor update Failed!', group: 'br', life: 3000 });
            }
        }
    }
};

onMounted(() => {
    const editFloorName = document.getElementById('editFloorName');
    nextTick(() => {
        if (editFloorName){
            editFloorName.focus();
        }
    });
});
</script>

<template>
    <div>
        <div class="field">
            <label for="company">Name<i class="text-red-400 text-italic">*</i> </label>
            <InputText id="editFloorName" v-model="name" class="w-full" placeholder="Ex: Lvl 1 - Semi-Bedroom; Lvl 2 - Master Bedroom" />
        </div>

        <p v-if="errorHandler" style="color: red">Please enter floor name</p>
        <div class="create-btn-wrappe">
            <Button label="Update" icon="pi pi-check" text="" @click="handleSubmitData" />
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
</style>
