<script setup>
import AppTopbar from '../layouts/AppTopbar.vue';
import AppFooter from '../layouts/AppFooter.vue';
import { onMounted } from 'vue';
import { useFloorStore } from '~/store/floors';
import { storeToRefs } from 'pinia';

const url = useRuntimeConfig();
const { getFloors } = useFloorStore();
const { floorList } = storeToRefs(useFloorStore());

const toast = useToast();

definePageMeta({
    middleware: 'auth',
    layout: 'false'
});

const loading = ref(false);
const startDate = ref(null);
const endDate = ref(null);
const selectedFloor = ref(null);
const roomsList = ref([]);
const visibleBookingDialog = ref(false);
const handleReset = () => {
    startDate.value = '';
    endDate.value = '';
    selectedFloor.value = '';
    roomsList.value = [];
};

const dateFormatter = (data) => {
    const dateStr = data;
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getRooms = async () => {
    loading.value = true;
    if ((!endDate.value) || !startDate.value) {
        console.log('Dates blocked');
        loading.value = false;
        return toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please Select Both Dates', group: 'br', life: 3000 });
        
    }
    
    const token = useCookie('token');
    const formattedStartDate = dateFormatter(startDate.value);
    const formattedEndDate = dateFormatter(endDate.value);

    const { data, pending, error } = await useAsyncData('getRooms', () =>
        $fetch(`${url.public.apiUrl}/api/v1/rooms${startDate.value ? `?start_date=${formattedStartDate}` : ''}${endDate.value ? `${startDate.value ? '&' : '?'}end_date=${formattedEndDate}` : ''}${selectedFloor.value ? `${startDate.value || endDate.value ? '&' : '?'}floor_id=${selectedFloor.value.id}` : ''}`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.length > 0) {
        roomsList.value = data.value?.map((item, index) => ({ ...item, index: index + 1 }));
        loading.value = false;
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No rooms available!', group: 'br', life: 3000 });
        loading.value = false;
    }
};

const bookingData = ref({
    room_id: '',
    roomName: '',
    start_date: '',
    end_date: '',
    price: '',
    floor_id: '',
    floorName: ''
});
const showBookingDialog = (roomInfo) => {
    // console.log('Room Info', roomInfo);
    bookingData.value = {
        room_id: roomInfo?.id,
        roomName: roomInfo?.name,
        start_date: dateFormatter(startDate.value),
        end_date: dateFormatter(endDate.value),
        price: roomInfo?.price_per_night,
        floor_id: roomInfo?.floor?.id,
        floorName: roomInfo?.floor?.name
        
    };
    console.log('Booking Data', bookingData.value);
    visibleBookingDialog.value = true;

};

getFloors();

const closeCreateModal = (evn) => {
    visibleBookingDialog.value = false;
    getRooms();
};


onMounted(() => {
    console.log('Mounted', url);
});
</script>

<template>
    <div class="main-wrapper">
        <AppTopbar />

        <div class="dash-banner">
            <div class="banner-content">
                <!-- <pre>{{url.public.apiUrl}}</pre>
                <pre>{{apiLink}}</pre> -->
                <h1 class="text-white">Welcome to <b>HRS's</b> <i>Hotel Reservation System</i></h1>
                <h2 class="text-white">Book a suitable room for you and your loved ones!</h2>
            </div>
            <Toolbar class="border-0 px-0 flex align-items-end mt-5" style="background-color: transparent; border: none; position: relative; top: 0px;">
                <template #start>
                    <div class="flex gap-2">
                        <div class="flex-auto">
                            <label for="icondisplay" class="font-bold block mb-2 dash-labels">Check In: </label>
                            <Calendar v-model="startDate" showIcon iconDisplay="input" inputId="icondisplay" placeholder="From" />
                        </div>
                        <div class="flex-auto">
                            <label for="icondisplay" class="font-bold block mb-2 dash-labels"> Check Out: </label>
                            <Calendar v-model="endDate" showIcon iconDisplay="input" inputId="icondisplay" placeholder="To" />
                        </div>
                        <div class="flex-auto">
                            <label for="icondisplay" class="font-bold block mb-2 dash-labels">Floor: (Optional) </label>
                            <Dropdown v-model="selectedFloor" :options="floorList" filter resetFilterOnHide optionLabel="name" placeholder="Select Floor" checkmark :highlightOnSelect="true" class="w-full drop" />
                        </div>
                    </div>
                </template>

                <template #end>
                    <Button @click="getRooms" class="w-full" label="Check Availability" :loading="loading" />
                    <Button @click="handleReset" label="Reset" severity="danger" class="ml-2" style="width: 100px" />
                </template>
            </Toolbar>
        </div>

        <!-- Main Content -->
        <div class="dash">
            <h5 v-if="roomsList?.length > 0" class="text-start mb-3 ml-2" style="text-decoration: underline">Available Rooms: {{ roomsList?.length }}</h5>
            <div class="grid container pt-10">
                <div v-for="room in roomsList" :key="room" class="col-12 lg:col-6 xl:col-3">
                    <div class="mb-0 room-card">
                        <div>
                            <div class="bg-primary-800 w-fit px-2 py-1 room-title">
                                <h4 v-tooltip.top="{ value: `Room no.: ${room?.name}` }" class="text-white text-center mb-0">
                                    Room No.
                                    <br />
                                    <i class="trunc-text">{{ room?.name }}</i>
                                </h4>
                            </div>

                            <div class="seats-info">
                                <b>Total Seats: {{ room?.seats }}</b>

                                <h5 class="m-0 mb-1">
                                    <b class="price-info"> Price: ${{ room?.price_per_night }} </b>
                                </h5>

                                <h6 v-tooltip.left="{ value: `Layout: ${room?.floor?.name}` }" class="m-0 mb-3 layout-info">
                                    <u>Layout:</u>
                                    <br />
                                    <i class="">{{ room.floor?.name }}</i>
                                </h6>
                                <Button @click="showBookingDialog(room)" label="Book" severity="primary" class="ml-4 mt-5" size="large" style="width: 120px; position: absolute; top: 90px;" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Dialog v-model:visible="visibleBookingDialog" modal header="Room Booking" dismissableMask="true" :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <ReservationsClientBooking :param="{bookingData}" @closeCreateModal="closeCreateModal($event)" />
        </Dialog>
        <Toast position="bottom-right" group="br" />

        <AppFooter />
    </div>
</template>

<style lang="scss" scoped>
.main-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.dash-banner {
    background-image: url('../public/demo/images/dashboard_banner.jpeg');
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 255px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    text-align: center;
    margin-top: 70px;
    display: flex;
    flex-direction: column;
}

.banner-content {
    max-width: 90%;
}

.dash {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    max-height: calc(100vh - 370px);
    padding: 20px;
    width: 85%;
    margin: 0 auto;
}

.dash-footer {
    margin-top: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
}

.dash-labels {
    text-align: start;
}

.drop {
    min-width: 200px !important;
    max-width: 200px !important;
}

.room-card {
    background-image: url('../public/demo/images/booking_thumbnail.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 384px;
    height: 245px;
    border-radius: 15px;
    overflow: hidden;
    position: relative;
    .room-title {
        position: relative;
        border-radius: 10px;
        top: 67px;
        left: 62.5px;
    }
    .seats-info {
        position: relative;
        top: 8px;
        left: 207px;
    }

    .price-info {
        max-width: 170px;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .layout-info {
        max-width: 170px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
}

.trunc-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    display: block;
    width: 90px;
    padding: 0 10px;
}
</style>
