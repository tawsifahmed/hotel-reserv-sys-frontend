<script setup>
// const profileData = ref(userProfile);
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useUserStore } from '~/store/user';
import Password from 'primevue/password';
import { useAuthStore } from '~/store/auth'; // import the auth store we just created
const { passwordReset } = useAuthStore(); // use authenticateUser action from  auth store
// const { authenticated, checkOTP, resendOtpResponse, resendOtpMsg, authOtp, resetState } = storeToRefs(useAuthStore());

const toast = useToast();
const { userProfile } = defineProps(['userProfile']);
const { updateUser } = useUserStore();
const loading = ref(false);
const userId = ref(userProfile?.data.id);
const userName = ref(userProfile?.data?.name);
const phone = ref(userProfile?.data?.phone);
const email = ref(userProfile?.data?.email);
const address = ref(userProfile?.data?.address);
const newPassword = ref({
    password: '',
    confirm_password: ''
});

const newPassError = ref(false);
const confirmPassError = ref(false);

watch(newPassword.value, () => {
    if (newPassword.value.password !== newPassword.value.confirm_password && newPassword.value.confirm_password !== '' && newPassword.value.password !== '') {
        newPassError.value = true;
        confirmPassError.value = true;
    } else {
        newPassError.value = false;
        confirmPassError.value = false;
    }
});

const handleSubmit = async () => {
    if (!userName.value || userName.value.trim() === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: "Users's Name cannot be empty", group: 'br', life: 3000 });
        return;
    }
    loading.value = true;
    const response = await updateUser(userId.value, userName.value, phone.value, email.value, address.value);
    if (response?.code === 200) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'Profile Updated Successfully', group: 'br', life: 3000 });
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Profile Update Failed', group: 'br', life: 3000 });
    }
    loading.value = false;
};

const newPasswordHandler = async () => {
    loading.value = true;
    if (newPassword.value.password === '' || newPassword.value.confirm_password === '') {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Password required', group: 'br', life: 3000 });
        newPassError.value = true;
        confirmPassError.value = true;
        loading.value = false;
        return;
    } else if (newPassword.value.password !== newPassword.value.confirm_password) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', group: 'br', life: 3000 });
        loading.value = false;
        newPassError.value = true;
        confirmPassError.value = true;
        return;
    } else {
        const response = await passwordReset(email.value, newPassword);
        // console.log(response);
        if (response.code == 200) {
            newPassword.value.password = '';
            newPassword.value.confirm_password = '';
            newPassError.value = false;
            confirmPassError.value = false;
            loading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: response.message, group: 'br', life: 3000 });
        } else {
            loading.value = false;
            toast.add({ severity: 'error', summary: 'Error', detail: response.message, group: 'br', life: 3000 });
        }
    }
};
</script>
<template>
    <!-- <pre>{{ userProfile }}</pre> -->
    <TabView>
        <TabPanel header="General Info">
            <form @submit.prevent="handleSubmit" class="grid">
                <div class="col-12 lg:col-6 mb-3 mt-4">
                    <FloatLabel>
                        <InputText id="name" class="w-full" v-model="userName" />
                        <label for="name">Name</label>
                    </FloatLabel>
                </div>
                <div class="col-12 lg:col-6 mb-3 mt-4">
                    <FloatLabel>
                        <InputText id="phone" v-model="phone" type="number" class="w-full" />
                        <label for="phone">Phone</label>
                    </FloatLabel>
                </div>
                <div class="col-12 lg:col-6 mb-3">
                    <FloatLabel>
                        <InputText id="email" v-model="email" type="email" class="w-full" disabled />
                        <label for="email">Email</label>
                    </FloatLabel>
                </div>
                <div class="col-12 lg:col-6 mb-3">
                    <FloatLabel>
                        <InputText id="address" v-model="address" class="w-full" />
                        <label for="address">Address</label>
                    </FloatLabel>
                </div>
                <div class="col-12 mb-3 flex justify-content-center">
                    <Button class="px-4" type="submit" label="Save" :loading="loading" />
                </div>
            </form>
        </TabPanel>
        <TabPanel header="Password">
            <br />
            <br />

            <form @submit.prevent="newPasswordHandler" class="grid form-width mx-auto">
                <div class="col-12 mb-3">
                    <FloatLabel>
                        <Password id="passw" v-model="newPassword.password" placeholder="Enter new password" :feedback="false" :invalid="newPassError" toggleMask class="w-full" inputClass="w-full" :inputStyle="{ padding: '0.78rem' }"></Password>

                        <label for="passw">New Password</label>
                    </FloatLabel>
                </div>
                <div class="col-12">
                    <FloatLabel>
                        <Password
                            id="password2"
                            v-model="newPassword.confirm_password"
                            placeholder="Confirm new password"
                            :feedback="false"
                            :invalid="confirmPassError"
                            toggleMask
                            class="w-full"
                            inputClass="w-full"
                            :inputStyle="{ padding: '0.78rem' }"
                        ></Password>

                        <label for="password2">Confirm Password</label>
                    </FloatLabel>
                </div>
                <div class="col-12 mt-3 mb-3 px-5 flex justify-content-center">
                    <Button class="px-4" type="submit" label="Save" :loading="loading" />
                </div>
            </form>
        </TabPanel>
        <Toast position="bottom-right" group="br" />
    </TabView>
</template>

<style lang="scss" scoped>
.button {
    background-color: #059669;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
}
.img-label {
    position: absolute;
    right: 5px;
    bottom: 5px;
    z-index: 1;
    cursor: pointer;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
}

.form-width {
    width: 50%;
}
</style>
