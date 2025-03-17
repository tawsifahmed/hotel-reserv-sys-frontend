<script setup>
const url = useRuntimeConfig();
const token = useCookie('token');
const notificationData = ref([]);
const page = ref(1);
const totalPage = ref(1);
const emit = defineEmits(['closeNotification']);
const toast = useToast();
import accessPermission from '~/composables/userTypeChecker';

const isAdmin = ref(accessPermission('admin'));


const handleClick = async (element) => {
    // console.log('element =>', element.reservation_id);
    try {
        const { data, pending, error } = await useFetch(`${url.public.apiUrl}/api/v1/notifications/update/${element.id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token.value}`
            },
            body: {
                is_read: 1
            }
        });
        // return
        if (isAdmin.value === true){
            await navigateTo({ path: `/admin-dashboard/reservations/`, query: { booking_key: element.reservation_id } });
            emit('closeNotification');
        } else {
            await navigateTo({ path: `/my-bookings/`, query: { booking_key: element.reservation_id } });
            emit('closeNotification');
        }
        await fetchData();
    } catch (e) {
        console.log(e);
    }
};

const fetchData = async () => {
    try {
        const { data, pending, error } = await useFetch(`${url.public.apiUrl}/api/v1/notifications?limit=5&page=${page.value}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        });

        if (data.value) {
            // console.log('notification data =>', data.value);
            notificationData.value = data.value?.data;
            totalPage.value = Math.ceil(data.value?.total / 5);
        }
    } catch (e) {
        console.log(e);
    }
};

const init = async () => {
    await fetchData();
};

init();

const loadingRead = ref(false);
const handleReadAll = async () => {
    loadingRead.value = true;
    try {
        const { data, pending, error } = await useFetch(`${url.public.apiUrl}/api/v1/notifications/read-all`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        });

        if (data.value) {
            // console.log('real all data =>', data.value);
            await fetchData();
            toast.add({ severity: 'success', summary: 'Successful', detail: 'All notifications marked as read', group: 'br', life: 3000 });
            loadingRead.value = false;
        }
    } catch (e) {
        console.log(e);
        loadingRead.value = false;
        toast.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong!', group: 'br', life: 3000 });
    }
}

const handleNavigate = async (type) => {
    if (type === 'prev' && page.value > 1) {
        page.value -= 1;
    } else {
        page.value += 1;
    }
    await fetchData();
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const date = new Date(dateString);
    return date.toLocaleString('en-US', options);
};
</script>
<template>
    <div  class="bg-white card1">
        <!-- <pre>{{ notificationData }}</pre> -->
         <div v-if="notificationData.length > 0">
             <div v-for="notify in notificationData" :key="notify" class="">
                 <div @click="handleClick(notify)" :class="`notifyTitle ${notify.is_read === 0 ? 'unread' : ''}`">
                     <p>{{notify.text}} at {{formatDate(notify.created_at)}}</p>        
                 </div>
             </div>
         </div>
        <div class="bg-white text-center text-lg" v-else>
            No notifications!
        </div>
        <div class="flex justify-content-between align-items-center mt-1">
            <Button class="invisible" label="Read All" />
            <div class="flex gap-2 justify-content-center">
                <Button @click="handleNavigate('prev')" :disabled="page === 1 ? true : false" icon="pi pi-chevron-left" outlined aria-label="Filter" />
                <Button @click="handleNavigate('')" :disabled="totalPage === page || !notificationData.length > 0 ? true : false" icon="pi pi-chevron-right" outlined aria-label="Filter" />
            </div>
            <Button class="bg-white hover:bg-gray-200  text-indigo-500 hover:text-indigo-600" label="Read All" @click="handleReadAll" :loading="loadingRead"/>
        </div>
    </div>
    
</template>

<style lang="scss" scoped>
.card1 {
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    width: 30rem;
    padding: 10px;
}
.card2 {
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    width: 30rem;
    padding: 10px;
    padding-top: 30px;
    padding-bottom: 30px;
}

.notifyTitle {
    padding: 10px;
    margin: 5px 0px;
    border: 1px solid rgba(218, 218, 218, 0.425);
    border-radius: 5px;
    cursor: pointer;
    text-wrap: wrap;
}

.unread {
    background-color: #60f7c949;
}

.invisible {
    visibility: hidden;
}

</style>
