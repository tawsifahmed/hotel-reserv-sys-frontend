<script setup>
import apiLink from '../utils/apiLinks';
const url = useRuntimeConfig();
onMounted(() => {
    console.log('Mounted', url);
});
import AppTopbar from '../layouts/AppTopbar.vue';
import AppFooter from '../layouts/AppFooter.vue';
import { onMounted } from 'vue';
definePageMeta({
    middleware: 'auth',
    layout: 'false'
})

const startDate = ref(null);
const endDate = ref(null);
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
            <Toolbar class="border-0 px-0 flex align-items-end mt-5" style="background-color: transparent; border: none; positiom: relative; top: 50px;">
                <template #start>
                    <div class="flex gap-2">
                        
                        <div class="flex-auto">
                            <label for="icondisplay" class="font-bold block mb-2 dash-labels">Check In: </label>
                            <Calendar v-model="startDate" @date-select="handleChange('startDate', $event)" showIcon iconDisplay="input" inputId="icondisplay" />
                        </div>
                        <div class="flex-auto">
                            <label for="icondisplay" class="font-bold block mb-2 dash-labels"> Check Out: </label>
                            <Calendar v-model="endDate" @date-select="handleChange('endtDate', $event)" showIcon iconDisplay="input" inputId="icondisplay" />
                        </div>
                        <div class="flex-auto">
                            <label for="icondisplay" class="font-bold block mb-2 dash-labels">Floor: (Optional) </label>
                            <Dropdown @change="filterTasks()" v-model="selectedProject" :options="totalProjects"
                            optionLabel="name" placeholder="Select floor (Optional)" />
                        </div>
                    </div>
                </template>
    
                <template #end>
                    <Button @click="handleGenerate" class="w-full" label="Check Availability" :loading="loading" />
                </template>
            </Toolbar>
        </div>

        <!-- Main Content -->
        <div class="dash">
            <div class="grid container mx-auto pt-10">
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card mb-0">
                        <!-- Dashboard content goes here (cards, etc.) -->
                    </div>
                </div>
                <!-- Add more cards or content here as needed -->
                <div class="col-12 lg:col-6 xl:col-3">
                    <div class="card mb-0">
                        <!-- Another card -->
                    </div>
                </div>
                <!-- Add more content if necessary -->
            </div>
        </div>

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
    height: 370px; /* Set the height of the banner */
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    text-align: center;
    margin-top: 70px; /* Give space between navbar and banner */
    display: flex;
    flex-direction: column;
}

.banner-content {
    max-width: 90%;
}

.dash {
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* Ensure the .dash div takes up all available space */
    overflow-y: auto; /* Allows scrolling when content exceeds height */
    max-height: calc(100vh - 370px); /* Ensure the dash doesn't exceed available height */
    padding: 20px;
}

.dash-footer {
    margin-top: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
    /* Optional styling for the footer */
}

.dash-labels {
    text-align: start;
}

</style>
