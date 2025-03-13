import { defineStore } from 'pinia';
import apiLink from '../utils/apiLinks';
export const useReservationsStore = defineStore('floors', () => {
    
    const reservList = ref([]);
    const floorsLength = ref(null);


    const getFloors = async () => {
        const token = useCookie('token');
        const { data, pending, error } = await useAsyncData('roomListP', () =>
            $fetch(`${apiLink}/api/v1/floors`, {
                headers: {
                    Authorization: `Bearer ${token.value}`
                }
            })
        );
        if (data.value?.length > 0) {
            floorList.value = data.value?.map((item, index) => ({ ...item, index: index + 1 }));
            if (floorList.value.length === 1) {
                floorsLength.value = 1;
                
            }else{
                floorsLength.value = null;
            }
    
        }
    };


    return { getFloors, floorList, floorsLength };
});
