<script setup>
import AppTopbar from '../layouts/AppTopbar.vue';
import AppFooter from '../layouts/AppFooter.vue';
import { onMounted } from 'vue';
import { useFloorStore } from '~/store/floors';
import { storeToRefs } from 'pinia';
import { useUserStore } from '~/store/user';

const { getUserData } = useUserStore();
const { userProfile } = storeToRefs(useUserStore());
const { getFloors } = useFloorStore();
const { floorList } = storeToRefs(useFloorStore());
const url = useRuntimeConfig();
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
    dateDuration.value = 0;
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


// date duration to calculate total price for booking
const dateDuration = ref(0);
const getDateCountLength = () => {
    const diffTime = endDate.value - startDate.value;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    dateDuration.value = diffDays;
};

const roomsLength = ref();
const getRooms = async (funcCallType) => {
    roomsLength.value = null;
    loading.value = true;
    if ((!endDate.value) || !startDate.value) {
        console.log('Dates blocked');
        loading.value = false;
        return toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please Select Both Dates', group: 'br', life: 3000 });
    }

    if (new Date(endDate.value) < new Date(startDate.value)) {
        console.log('Invalid date range');
        loading.value = false;
        return toast.add({ severity: 'warn', summary: 'Warning', detail: 'Check out date must be equal to or after Check in date', group: 'br', life: 3000 });
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
        if (roomsList.value.length === 1) {
            roomsLength.value = 1;
        } else {
            roomsLength.value = null;
        }
        getUserData();
        getDateCountLength();
        loading.value = false;
    } else {
        if (roomsLength.value !== 1 && funcCallType === 'clicked') {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No rooms available!', group: 'br', life: 3000 });
            roomsLength.value = null;
        }
        roomsList.value = [];
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
        floorName: roomInfo?.floor?.name,
        userData: userProfile.value
    };

    // console.log('Booking Data', bookingData.value);
    visibleBookingDialog.value = true;
};

getFloors();

const closeCreateModal = (evn) => {
    visibleBookingDialog.value = false;
    getRooms('closed');
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
                <h2 class="text-white">Book suitable rooms for you & your loved ones!</h2>
            </div>
            <Toolbar class="border-0 px-0 flex align-items-end mt-5" style="background-color: transparent; border: none; position: relative; top: 0px;">
                <template #start>
                    <div class="flex flex-wrap gap-2">
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
                            <Dropdown v-model="selectedFloor" showClear :options="floorList" filter resetFilterOnHide optionLabel="name" placeholder="Select Floor" checkmark :highlightOnSelect="true" class="w-full drop" />
                        </div>
                    </div>
                </template>

                <template #end>
                    <Button @click="getRooms('clicked')" class="w-full" label="Check Availability" :loading="loading" />
                    <Button @click="handleReset" label="Reset" severity="danger" class="ml-2" style="width: 100px" />
                </template>
            </Toolbar>
        </div>

        <!-- Main Content -->
         <div class="second-bg relative">

             <div class="dash">
                 <h4 v-if="roomsList?.length > 0" class="text-start mb-5 mt-2 bg-white py-3 px-6 w-fit font-bold room-count">Available Rooms: {{ roomsList?.length }}</h4>
                 <div v-if="roomsList?.length > 0" class="grid container mt-3 pt-10 flex flex-wrap justify-content-center align-items-center gap-5">
                     <div v-for="room in roomsList" :key="room" class="" style="box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px; border-radius: 15px;">
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
                                         <b class="price-info">Price:${{ room?.price_per_night * dateDuration }} </b>
                                     </h5>
     
                                     <h6 v-tooltip.left="{ value: `Layout: ${room?.floor?.name}` }" class="m-0 mb-3 layout-info">
                                         <u>Layout:</u>
                                         <br />
                                         <i class="">{{ room.floor?.name }}</i>
                                     </h6>
                                     <Button @click="showBookingDialog(room)" label="Reserve" severity="primary" class="ml-4 mt-5" size="large" style="width: 120px; position: absolute; top: 90px;" />
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
                 <div class="grid h-full absolute elsi" v-else>
                    <!-- <div class="col-12 xl:col-6 h-full"> 
                        <div class="card h-card flex flex-column justify-content-center align-items-center">
                            <img v-tooltip.top="{ value: 'Hotel Reservation System' }" src="/demo/images/login/avatar.png" alt="Image" height="80" class="mb-3" />
                            <h3>Hotel Reservation System</h3>
                        </div>
                    </div>
                    <div class="col-12 xl:col-6 h-full"> 
                        <div class="card h-card">
                            <ul>
                                <li>API  is configured in project root directory: <i>/utils/apiLink.js</i> </li>
                                <li>Default given api link: </li>
                                <li></li>
                                <li></li>
                            </ul>
                        </div>
                    </div> -->
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

.second-bg {
    background-image: url('../public/demo/images/Imgur1.gif');
    background-size: contain;
    background-position: bottom;
    background-repeat: repeat-x;
    overflow-y: auto;
    max-height: calc(100vh - 370px);
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background-color: white;
}

.banner-content {
    max-width: 90%;
}

.dash {
    

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

.room-count {
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    text-decoration: underline; 
    border: 3px solid black; 
    display: flex; 
    justify-self: center;
    margin-bottom: 10px;
}

.elsi {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.h-card{
    max-height: 400px;
    min-height: 400px;
    margin-top: 100px;
}
</style>
