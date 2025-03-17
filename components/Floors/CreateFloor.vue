<script setup>
const url = useRuntimeConfig();
const toast = useToast();

const name = ref('');

const errorHandler = ref(false);

const emit = defineEmits(['closeCreateModal']);

const handleSubmitData = async () => {
    if (name.value === '') {
        errorHandler.value = true;
        return;
    } else {
        errorHandler.value = false;
        if (!errorHandler.value) {
            const token = useCookie('token');
            const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/floors/store`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                body: {
                    name: name.value
                }
            });
            // return

            if (data.value.code === 201) {
                name.value = null;
                emit('closeCreateModal', false);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Floor Created successfully!', group: 'br', life: 3000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Floor Creation Failed!', group: 'br', life: 3000 });
            }
        }
    }
};

onMounted(() => {
    const createFloorName = document.getElementById('createFloorName');
    nextTick(() => {
        if (createFloorName){
            createFloorName.focus();
        }
    });
});
</script>

<template>
    <div>
        <div class="field">
            <label for="company"
                >Floor Layout<i class="text-red-400 text-italic">*</i> 
            </label>
            <InputText id="createFloorName" v-model="name" class="w-full" placeholder="Ex: Lvl 1 - Semi-Bedroom; Lvl 2 - Master Bedroom" />
        </div>

        <p v-if="errorHandler" style="color: red">Please enter floor name</p>
        <div class="create-btn-wrapper mb-0">
            <Button label="Save" icon="pi pi-check" text="" @click="handleSubmitData" />
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
</style>
