<script setup>
const url = useRuntimeConfig();
const toast = useToast();
const props = defineProps({
    param: {
        type: Object,
        required: true
    }
});
const floorList = ref(props.param.floorList);

const roomNo = ref('');
const selectedFloor = ref([]);
const seatNo = ref(1);
const roomPrice = ref();
const errorHandler = ref(false);

const emit = defineEmits(['closeCreateModal']);

const handleSubmitData = async () => {
    if (roomNo.value === '' || selectedFloor.value === '' || seatNo.value === '' || roomPrice.value === '') {
        errorHandler.value = true;
        return;
    } else {
        errorHandler.value = false;
        if (!errorHandler.value) {
            const token = useCookie('token');
            const { data, pending } = await useFetch(`${url.public.apiUrl}/api/v1/rooms/store`, {
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
            // return

            if (data.value.code === 201) {
                roomNo.value = null;
                selectedFloor.value = null;
                seatNo.value = null;
                roomPrice.value = null;
                emit('closeCreateModal', false);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Room created successfully!', group: 'br', life: 3000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Room creation failed!', group: 'br', life: 3000 });
            }
        }
    }
};

onMounted(() => {
    const createFloorName = document.getElementById('createFloorName');
    nextTick(() => {
        if (createFloorName) {
            createFloorName.focus();
        }
    });
});
</script>

<template>
    <div>
        <div class="field">
            <!-- {{ selectedFloor }} -->
            <label>Room No.<i class="text-red-400 text-italic">*</i> </label>
            <InputText id="createFloorName" v-model="roomNo" class="w-full" placeholder="Enter room number" />
        </div>
        <div class="field flex flex-column">
            <label>Floor Layout<i class="text-red-500">* 
                                <span v-tooltip.right="{ value: 'A floor must be created first, before creating a room.' }" class="pi pi-info-circle cursor-pointer text-primary text-sm instruction-tip"></span>

            </i></label>
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

        <p v-if="errorHandler" style="color: red">Please enter floor name</p>
        <div class="create-btn-wrapper mb-0">
            <Button label="Save" icon="pi pi-check" text="" @click="handleSubmitData" />
        </div>
    </div>
</template>

<style lang="scss">
.text-danger {
    color: red;
}

.create-btn-wrapper {
    display: flex;
    justify-content: end;
}

.seat-no {
    .p-inputnumber-input {
        text-align: center !important;
    }
}
</style>
