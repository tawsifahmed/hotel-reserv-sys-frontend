<script setup>
const url = useRuntimeConfig();
const token = useCookie('token');
const notificationData = ref([]);
const page = ref(1);
const totalPage = ref(1);
const emit = defineEmits(['closeNotification']);
const toast = useToast();


const handleClick = async (element) => {
    try {
        const { data, pending, error } = await useFetch(`${url.public.apiUrl}/notification/update/${element.id}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token.value}`
            },
            body: {
                is_read: 1
            }
        });
        // console.log('Notification_element =>', element);
        if (element.payload?.type === "task_details"){
            await navigateTo({ path: `/companies/${companyId}/spaces/${element?.space_id}/projects/${element?.project_id}`, query: { task_key: element?.task_id } });
            emit('closeNotification', false);
        } 
        await fetchData();
    } catch (e) {
        console.log(e);
    }
};

const fetchData = async () => {
    try {
        const { data, pending, error } = await useFetch(`${url.public.apiUrl}/notification/list?limit=5&page=${page.value}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        });

        if (data.value) {
            // console.log('notification data =>', data.value);
            notificationData.value = data.value.data;
            totalPage.value = Math.ceil(data.value.total / 5);
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
        const { data, pending, error } = await useFetch(`${url.public.apiUrl}/notification/read-all`, {
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
</script>
<template>
    <div  class="card card1">
        <h5 class="mb-1">Notifications</h5>
        <!-- <pre>{{ notificationData }}</pre> -->
        <div v-if="notificationData.length > 0" v-for="notify in notificationData" :key="notify" class="">
            <div @click="handleClick(notify)" v-html="notify.title" :class="`notifyTitle ${notify.is_read === 0 ? 'unread' : ''}`"></div>
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
            <Button class="hover:bg-gray-200" label="Read All" @click="handleReadAll" :loading="loadingRead"/>
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
