<script setup>
import { useLayout } from '@/layouts/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layouts/AppConfig.vue';
import accessPermission from '~/composables/userTypeChecker';

const isAdmin = ref(accessPermission('admin'));
const { layoutConfig } = useLayout();
const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

definePageMeta({
    middleware: 'auth',
    layout: false
});

const loginForm = ref(true);
const verifyOTPForm = ref(false);
const resetForm = ref('');
const newPassword = ref({
    password: '',
    confirm_password: ''
});
const loading = ref(false);
const forgotOtp = ref('');
// const loginForm = ref(false)
// const verifyOTPForm = ref(true)

import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useAuthStore } from '~/store/auth'; // import the auth store we just created
const { authenticateUser, otpVerify, resendOtp, forgotPassword, forgotPasswordOtp, passwordReset } = useAuthStore(); // use authenticateUser action from  auth store
const { authenticated, checkOTP, resendOtpResponse, resendOtpMsg, authOtp, checkType } = storeToRefs(useAuthStore());

import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import Toast from 'primevue/toast';
const toast = useToast();

// definePageMeta({
//     middleware: 'auth',
//     // this should match the name of the file inside the middleware directory
// })
const router = useRouter();

const user = ref({
    email: null,
    password: null,
    remember: false
});

const verifyUser = ref({
    email: null,
    password: null,
    otp: null
});

const errorData = ref({
    emailError: false,
    passwordError: false,
    otpError: false
});

const startTimer = () => {
    timer.value = 30;
    showResendButton.value = false;
    countdown = setInterval(() => {
        if (timer.value > 0) {
            timer.value -= 1;
        } else {
            clearInterval(countdown);
            showResendButton.value = true;
        }
    }, 1000);
};

const loginBtnHandle = ref(false);
const timer = ref();
const showResendButton = ref(false);
let countdown = null;

const handleLoginSubmit = async () => {
    console.log(user.value);
    loginBtnHandle.value = true;
    user.value.email ? (errorData.value.emailError = false) : (errorData.value.emailError = true);
    user.value.password ? (errorData.value.passwordError = false) : (errorData.value.passwordError = true);
    if (errorData.value.emailError || errorData.value.passwordError) {
        loginBtnHandle.value = false;
    } else {
        loginBtnHandle.value = true;
        if (user.value.remember) {
            localStorage.setItem('credentials', JSON.stringify(user.value));
        } else {
            localStorage.removeItem('credentials');
        }
        await authenticateUser(user.value); // call authenticateUser and pass the user object
        if (authenticated.value == true) {
            errorData.value.passwordError = false;
            errorData.value.emailError = false;
            toast.add({ severity: 'success', summary: 'Authorized', detail: 'Login Successful', group: 'br', life: 3000 });
            setTimeout(() => {
            if (checkType.value === 'admin') {
                router.push('/admin-dashboard');
            } else {
                router.push('/');
            }
            }, 450);
        } else {
            toast.add({ severity: 'error', summary: 'Authorization Failed!', detail: 'Invalid email or password', group: 'br', life: 3000 });
        }
        loginBtnHandle.value = false;
    }
};

const handleVerifySubmit = async () => {
    loginBtnHandle.value = true;
    verifyUser.value.email ? (errorData.value.emailError = false) : (errorData.value.emailError = true);
    verifyUser.value.otp ? (errorData.value.otpError = false) : (errorData.value.otpError = true);
    if (errorData.value.emailError || errorData.value.otpError) {
        loginBtnHandle.value = false;
    } else {
        await otpVerify(verifyUser.value);
        if (authenticated.value == true) {
            console.log('authOtpPPP', authOtp.value);
            toast.add({ severity: 'success', summary: 'Successfully Verified', detail: resendOtpMsg, group: 'br', life: 3000 });
            location.reload();
            router.push('/login');
        } else {
            toast.add({ severity: 'error', summary: 'Verification Failed', detail: resendOtpMsg, group: 'br', life: 3000 });
        }
        loginBtnHandle.value = false;
    }
};

const clickBlink = ref(false);

// Reset Functionality
const resetEmail = ref('');
const handleReset = () => {
    resetForm.value = 'email';
    loginForm.value = false;
};

const handleEmailSubmit = async () => {
    loading.value = true;
    if(resetEmail.value === ''){
        toast.add({ severity: 'error', summary: 'Error', detail: 'Email required', group: 'br', life: 3000 });
        loading.value = false;
        return;
    }else{
        const response = await forgotPassword(resetEmail.value);
        if (response.code == 200) {
            resetForm.value = response.message;
            loading.value = false;
        } else {
            loading.value = false;
            toast.add({ severity: 'error', summary: 'Error', detail: response.message, group: 'br', life: 3000 });
        }
    }
};

const confirmPasswordOtp = ref(false)
const forgotOtpHandler = async () => {
    loading.value = true;
    if(forgotOtp.value === ''){
        confirmPasswordOtp.value = true;
        toast.add({ severity: 'error', summary: 'Error', detail: 'OTP required', group: 'br', life: 3000 });
        loading.value = false;
        return;
    }
    const response = await forgotPasswordOtp(resetEmail.value, forgotOtp.value);
    if (response.code == 200) {
        confirmPasswordOtp.value = false;
        resetForm.value = response.message;
        loading.value = false;
        toast.add({ severity: 'success', summary: 'Success', detail: response.message, group: 'br', life: 3000 });        
    } else {
        loading.value = false;
        toast.add({ severity: 'error', summary: 'Error', detail: response.message, group: 'br', life: 3000 });
    }
};

const newPasswordHandler = async () => {
    loading.value = true;
    if(newPassword.value.password === '' || newPassword.value.confirm_password === ''){
        toast.add({ severity: 'error', summary: 'Error', detail: 'Password required', group: 'br', life: 3000 });
        loading.value = false;
        return;

    }else if (newPassword.value.password !== newPassword.value.confirm_password) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Passwords do not match', group: 'br', life: 3000 });
        loading.value = false;
        return;
    }
    else{
        const response = await passwordReset(resetEmail.value, newPassword);
        console.log(response);
        if (response.code == 200) {
            resetForm.value = '';
            loginForm.value = true;
            resetForm.value = response.message;
            loading.value = false;
            toast.add({ severity: 'success', summary: 'Success', detail: response.message, group: 'br', life: 3000 });
        } else {
            loading.value = false;
            toast.add({ severity: 'error', summary: 'Error', detail: response.message, group: 'br', life: 3000 });
        }
    }
};
watch(
    () => verifyOTPForm.value,
    (newVal) => {
        if (newVal) {
            startTimer();
        } else {
            clearInterval(countdown);
        }
    }
);
onMounted(() => {
    const userData = localStorage.getItem('credentials');
    console.log('User Data storage: ', userData);
    if (userData) {
        user.value = JSON.parse(userData);
    }
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <Toast position="bottom-right" group="br" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div v-if="loginForm" class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="80" class="mb-3" />
                        <div data-v-d804f83c="" class="text-900 text-3xl font-medium mb-3">Sign in to continue</div>
                    </div>

                    <form @submit.prevent="handleLoginSubmit">
                        <div class="field md:w-28rem mb-4">
                            <label for="email" class="block text-900 text-xl font-medium mb-2">Work Email</label>
                            <InputText id="email" v-model="user.email" type="email" placeholder="Enter your work email" class="w-full" style="padding: 1rem" />
                            <small id="email-help" class="error-report red-text red-text" v-if="errorData.emailError"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Email required! </small>
                        </div>
                        <div class="field md:w-28rem mb-4">
                            <label for="password" class="block text-900 font-medium text-xl mb-2">Password</label>
                            <Password id="password" v-model="user.password" placeholder="Enter password" :feedback="false" :toggleMask="true" class="w-full" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>
                            <small id="password-help" class="error-report red-text" v-if="errorData.passwordError"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Password required! </small>
                        </div>
                        <div class="flex align-items-center justify-content-between mb-5 gap-5">
                            <div class="flex align-items-center">
                                <Checkbox inputId="rememberme1" v-model="user.remember" binary class="mr-2"></Checkbox>
                                <label for="rememberme1">Remember me</label>
                            </div>
                            <a @click="handleReset" class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Forgot password?</a>
                        </div>
                        <Button type="submit" label="Sign In" :loading="loginBtnHandle" class="w-full p-3 text-xl" />
                    </form>
                    
                    <div class="flex flex-wrap items-center justify-between mt-4">
                        Don't have an account?&nbsp; <NuxtLink to="/register" class="forgot_pass md:mb-0"> Click Here.</NuxtLink>
                    </div>
                </div>
                <div v-if="resetForm == 'email'" class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="80" class="mb-3" />
                        <div data-v-d804f83c="" class="text-900 text-3xl font-medium mt-1 mb-3">Reset Password</div>
                    </div>
                    <form @submit.prevent="handleEmailSubmit">
                        <div class="field md:w-28rem mb-4">
                            <label for="email" class="block text-900 text-xl font-medium mb-2">Email</label>
                            <InputText id="email" v-model="resetEmail" type="email" required placeholder="example@gmail.com" class="w-full" style="padding: 1rem" />
                            <small id="email-help" class="error-report red-text" v-if="errorData.emailError"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Email required! </small>
                        </div>
                        <Button type="submit" label="Submit" :loading="loading" class="w-full p-3 text-xl"></Button>
                    </form>
                </div>
                <div v-if="resetForm == 'otp'" class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="80" class="mb-3" />
                        <div data-v-d804f83c="" class="text-900 text-3xl font-medium mt-1 mb-3">Verify OTP</div>
                    </div>
                    <form @submit.prevent="forgotOtpHandler">
                        <!-- <div class="field md:w-28rem mb-4">
                            <label for="email" class="block text-900 text-xl font-medium mb-2">Work Email</label>
                            <InputText id="email" v-model="verifyUser.email" type="email" placeholder="example@gmail.com" class="w-full" style="padding: 1rem" />
                            <small id="email-help" class="error-report red-text"  v-if="errorData.emailError">
                                <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Email required!
                            </small>
                        </div> -->
                        <div class="field md:w-28rem mb-4">
                            <label for="name" class="block text-900 text-xl font-medium mb-2">OTP</label>
                            <InputText id="name" v-model="forgotOtp" type="text" placeholder="Enter OTP" :invalid="confirmPasswordOtp" class="w-full" style="padding: 1rem" />
                            <small id="name-help" class="error-report red-text" v-if="errorData.otpError"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> OTP required! </small>
                        </div>
                        <Button type="submit" label="Verify" :loading="loading" class="w-full p-3 text-xl"></Button>
                    </form>
                </div>
                <div v-if="resetForm == 'new-password'" class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="80" class="mb-3" />
                        <div data-v-d804f83c="" class="text-900 text-3xl font-medium mb-3">Set Your New Password</div>
                    </div>
                    <form @submit.prevent="newPasswordHandler">
                        <div class="field md:w-28rem mb-5">
                            <label for="password" class="block text-900 font-medium text-xl mb-2">New Password</label>
                            <Password id="password" v-model="newPassword.password" placeholder="Enter password" :feedback="false" :toggleMask="true" class="w-full" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>
                        </div>
                        <div class="field md:w-28rem mb-5">
                            <label for="confirm-password" class="block text-900 font-medium text-xl mb-2">Confirm Password</label>
                            <Password id="confirm-password" v-model="newPassword.confirm_password" placeholder="Enter password" :feedback="false" :toggleMask="true" class="w-full" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>
                        </div>
                        <Button type="submit" label="Submit" :loading="loading" class="w-full p-3 text-xl"></Button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <AppConfig simple />
</template>

<style lang="scss" scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}
.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

.forgot_pass {
    text-decoration: none !important;
    border: none !important;
    background: none !important;
}

.blink_text {
    user-select: none !important;
    cursor: not-allowed !important;
    animation: blinker 0.7s linear infinite;
}

@keyframes blinker {
    50% {
        opacity: 0.5;
    }
}

.red-text {
    color: red !important;
}

//  Google Login
</style>
