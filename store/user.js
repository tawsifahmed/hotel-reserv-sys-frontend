import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {

    const userProfile = ref(null);
    const isLoading = ref(false);

    async function getUserData() {

        const token = useCookie('token');
        const { data, pending, error } = await useAsyncData(
            'userProf',
            () => $fetch('https://pbe.singularitybd.net/api/v1/users/profile', {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },

            }),
            // {
            //   watch: [this.userProfile]
            // }
        )
        userProfile.value = data.value;
    }

    async function updateUser(id, name, phone, email, address, image) {
        isLoading.value = true

        const formdata = new FormData()

        formdata.append('name', name);
        formdata.append('phone', phone);
        // formdata.append('email', email);
        formdata.append('address', address);
        if (image != null) {
            formdata.append('image', image);
        }
        const token = useCookie('token');

        try {
            const response = await fetch(`https://pbe.singularitybd.net/api/v1/users/update/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                body: formdata
            });

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            getUserData();
            const data = await response.json()
            console.log('User Update data =>', data)
            return data;
        } catch (error) {
            console.error('Error uploading file:', error)
            isLoading.value = false
        }
    }
    return { getUserData, updateUser, userProfile } 
})