<script setup>
const url = useRuntimeConfig();
const props = defineProps({
    param: {
        type: Object,
        required: true
    }
});
const toast = useToast();
const loading = ref(false);
const roomId = ref(props.param.roomId);

const roomNo = ref(props.param.roomNo);
const seatNo = ref(props.param.seatNo);
const roomPrice = ref(props.param.roomPrice);
const floorList = ref(props.param.floorList);
const floorLayout = ref(props.param.floorLayout);

const selectedFloor = ref({ name: props.param.floorLayout.name, id: props.param.floorLayout.id });

const errorHandler = ref(false);

const employeeForm = ref(true);

const emit = defineEmits(['closeEditModal']);

const handleSubmitData = async () => {
    loading.value = true;
    if (roomNo.value === '' || selectedFloor.value === '' || seatNo.value === '' || roomPrice.value === '') {
        errorHandler.value = true;
        loading.value = false;
        return;
    } else {
        errorHandler.value = false;
        if (!errorHandler.value) {
            const token = useCookie('token');
            const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/rooms/update/${roomId.value}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.value}`
                },
                body: {
                    name: roomNo.value,
                    floor_id: selectedFloor.value.id,
                    seats: seatNo.value,
                    price_per_night: roomPrice.value
                }
            });

            if (data.value.code === 200) {
                employeeForm.value = false;
                loading.value = false;
                emit('closeEditModal', false);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Tag Updated successfully!', group: 'br', life: 3000 });
            } else {
                loading.value = false;
                toast.add({ severity: 'error', summary: 'Error', detail: 'Tag Update Failed!', group: 'br', life: 3000 });
            }
        }
    }
};

onMounted(() => {
    const editTagName = document.getElementById('editTagName');
    nextTick(() => {
        if (editTagName){
            editTagName.focus();
        }
    });
});
</script>

<template>
    <div>
        <!-- {{ roomPrice }} -->
        <!-- {{seatNo}} -->
        <div class="field">
            <label>Room No.<i class="text-red-400 text-italic">*</i> </label>
            <InputText id="createFloorName" v-model="roomNo" class="w-full" placeholder="Enter room number" />
        </div>
        <div class="field flex flex-column">
            <label>Floor Layout<i class="text-red-500">*</i></label>
            <Dropdown v-model="selectedFloor" :options="floorList" filter resetFilterOnHide optionLabel="name" placeholder="Select Floor" checkmark :highlightOnSelect="false" class="w-full" />
        </div>
        <div class="field flex flex-column seat-no">
            <label for="company">No. of Seats<i class="text-red-400 text-italic">*</i> </label>
            <InputNumber v-model="seatNo" showButtons buttonLayout="horizontal" style="width: 100%; text-align: center" :min="1" :max="99">
                <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                </template>
                <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                </template>
            </InputNumber>
        </div>
        <div class="field flex flex-column">
            <!-- {{ selectedFloor }} -->
            <label for="company">Price<i class="text-red-400 text-italic">*</i> </label>
            <InputNumber class="w-full" v-model="roomPrice" buttonLayout="horizontal" placeholder="Set room price" min="1" showButtons mode="currency" currency="USD" />
        </div>
        <p v-if="errorHandler" style="color: red">Please enter tag name</p>
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
</style>
