<script setup>
import { useLayout } from '@/layouts/composables/layout';
import { onMounted, reactive, ref, watch } from 'vue';
import accessPermission from '~/composables/userTypeChecker';
const url = useRuntimeConfig();

definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

const isAdmin = ref(accessPermission('admin'));

const reservationsList = ref([]);
const pendingBookings = ref();
const confirmedBookings = ref();
const cancelledBookings = ref();

const init = async () => {
    
    const token = useCookie('token');
    const { data, pending, error } = await useAsyncData('rsrvationList', () =>
        $fetch(`${url.public.apiUrl}/api/v1/reservations`, {
            headers: {
                Authorization: `Bearer ${token.value}`
            }
        })
    );
    if (data.value?.length > 0) {
        reservationsList.value = data.value?.map((item, index) => ({ ...item, index: index + 1 }));
        pendingBookings.value = reservationsList.value.filter(item => item.status === 'pending').length;
        confirmedBookings.value = reservationsList.value.filter(item => item.status === 'confirmed').length;
        cancelledBookings.value = reservationsList.value.filter(item => item.status === 'cancelled').length;
    }
};



const { isDarkTheme } = useLayout();
const lineData = reactive({
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
            tension: 0.4
        },
        {
            label: 'Second Dataset',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
});
const items = ref([
    { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    { label: 'Remove', icon: 'pi pi-fw pi-minus' }
]);
const lineOptions = ref(null);

onMounted(async() => {
    if (isAdmin.value === false) {
        throw createError({ statusCode: 404, message: 'Access denied!', fatal: true });
    }
    await init();

    
});

const pieChartData = computed(() => {
    if (confirmedBookings.value || pendingBookings.value || cancelledBookings.value) {
        return {
            labels: ['Confirmed', 'Pending', 'Cancelled'],
            datasets: [
                {
                    data: [confirmedBookings.value, pendingBookings.value, cancelledBookings.value],
                    backgroundColor: ['#33bd7c', '#0ea5e9', '#475569'],
                    hoverBackgroundColor: ['#1a8251', '#0087c3', '#2c3644']
                }
            ]
        };
    }
    return null;
});

const pieChartOptions = computed(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    return {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };
});



const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const applyLightTheme = () => {
    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            y: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };
    pieChartOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: '#495057'
                }
            }
        }
    };

};

const applyDarkTheme = () => {
    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: '#ebedef'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            },
            y: {
                ticks: {
                    color: '#ebedef'
                },
                grid: {
                    color: 'rgba(160, 167, 181, .3)'
                }
            }
        }
    };
};

watch(
    isDarkTheme,
    (val) => {
        if (val) {
            applyDarkTheme();
        } else {
            applyLightTheme();
        }
    },
    { immediate: true }
);
</script>

<template>
    <div v-if="isAdmin" class="grid">
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0" :style="`border-left:6px solid black;`">
                <div  class="flex justify-content-between">
                    <h4 class="mb-0 block text-xl font-semibold tracking-tight">Total Bookings</h4>
                    <div class="text-900 font-bold text-2xl">{{ reservationsList.length }}</div>
                </div>
            </div>

        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0" :style="`border-left:6px solid #178d18bf;`">
                <div  class="flex justify-content-between">
                    <h4 class="mb-0 block text-xl font-semibold tracking-tight">Confirmed Bookings</h4>
                    <div class="text-900 font-bold text-2xl">{{ confirmedBookings }}</div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0" :style="`border-left:6px solid silver;`">
                <div  class="flex justify-content-between">
                    <h4 class="mb-0 block text-xl font-semibold tracking-tight">Pending Bookings</h4>
                    <div class="text-900 font-bold text-2xl">{{ pendingBookings }}</div>
                </div>
            </div>
        </div>
        <div class="col-12 lg:col-6 xl:col-3">
            <div class="card mb-0" :style="`border-left:6px solid crimson;`">
                <div  class="flex justify-content-between">
                    <h4 class="mb-0 block text-xl font-semibold tracking-tight">Cancelled Bookings</h4>
                    <div class="text-900 font-bold text-2xl">{{ cancelledBookings }}</div>
                </div>
            </div>
        </div>

        <!-- <div class="col-12 xl:col-6">
            <div class="card">
                <h5>Sales Overview</h5>
                <Chart type="line" :data="lineData" :options="lineOptions" />
            </div>
        </div> -->
        <div class="col-12 xl:col-6">
            <div class="card h-full">
                <h5>Booking Statistics</h5>
                <div class="w-full flex justify-content-center">
                    <Chart type="pie" :data="pieChartData" :options="pieChartOptions" class="w-full md:w-30rem" />
                </div>

                <!-- <Chart type="pie" :data="pieData" :options="pieOptions" /> -->
            </div>
        </div>

    </div>
</template>
