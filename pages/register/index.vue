<script setup>
import { useLayout } from '@/layouts/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layouts/AppConfig.vue';
import Toast from 'primevue/toast';
import { storeToRefs } from 'pinia'; // import storeToRefs helper hook from pinia
import { useAuthStore } from '~/store/auth'; // import the auth store we just created
const { registerUser } = useAuthStore(); // use authenticateUser action from  auth store
const { authenticated, userCreated, detectDuplicateEmail } = storeToRefs(useAuthStore());
const toast = useToast();
const router = useRouter();
const { layoutConfig } = useLayout();
const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

definePageMeta({
    middleware: 'auth',
    layout: false
});

const regForm = ref(true);
const verifyOTPForm = ref(false);

// const regForm = ref(false)
// const verifyOTPForm = ref(true)

const createUser = ref({
    userName: null,
    email: null,
    password: null,
    confirmPass: null
});

const errorData = ref({
    userNameError: false,
    emailError: false,
    passwordError: false,
    confirmPassError: false,
    confirmPassMismatch: false,
});

const regBtnHandle = ref(false);

const handleLoginSubmit = async () => {
    regBtnHandle.value = true;
    createUser.value.userName ? (errorData.value.userNameError = false) : (errorData.value.userNameError = true);
    createUser.value.email ? (errorData.value.emailError = false) : (errorData.value.emailError = true);
    createUser.value.password ? (errorData.value.passwordError = false) : (errorData.value.passwordError = true);
    createUser.value.confirmPass ? (errorData.value.confirmPassError = false) : (errorData.value.confirmPassError = true);

    if (createUser.value.confirmPass && createUser.value.password !== createUser.value.confirmPass) {
        errorData.value.confirmPassError = false;
        errorData.value.confirmPassMismatch = true;
    }

    if (createUser.value.password === createUser.value.confirmPass) {
        errorData.value.confirmPassMismatch = false;
    }

    if (createUser.value.confirmPass === '') {
        errorData.value.confirmPassMismatch = false;
        errorData.value.confirmPassError = true;
    }

    if (errorData.value.userNameError || errorData.value.emailError || errorData.value.passwordError || errorData.value.confirmPassError || errorData.value.confirmPassMismatch) {
        regBtnHandle.value = false;
    } else {
        await registerUser(createUser.value);
        if (detectDuplicateEmail.value === true) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'The email has already been taken', group: 'br', life: 3000 });
            regBtnHandle.value = false;
            return;
        } else if (userCreated.value === true) {
            console.log('authenticated =>', authenticated.value);
            toast.add({ severity: 'success', summary: 'Successfully Registered', detail: 'Proceeding to login.', group: 'br', life: 5000 });
            // setTimeout(() => {
            //     router.push('/login')
            // }, 300);
        } else {
            toast.add({ severity: 'error', summary: 'Registration Error', detail: '', group: 'br', life: 3000 });
        }
        regBtnHandle.value = false;
    }
};


const clickBlink = ref(false);

</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden pt-1">
        <div class="flex flex-column align-items-center justify-content-center">
            <Toast position="bottom-right" group="br" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div v-if="regForm" class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="80" class="mb-3" />
                        <div data-v-d804f83c="" class="text-900 text-3xl font-medium mb-3">Sign Up</div>
                    </div>

                    <form @submit.prevent="handleLoginSubmit">
                        <div class="field md:w-28rem mb-4">
                            <label for="name" class="block text-900 text-xl font-medium mb-2">Full Name</label>
                            <InputText id="name" v-model="createUser.userName" type="text" placeholder="John Doe" class="w-full" style="padding: 1rem" />
                            <small id="name-help" class="error-report red-text" v-if="errorData.userNameError"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Full name required! </small>
                        </div>
                        <div class="field md:w-28rem mb-4">
                            <label for="email" class="block text-900 text-xl font-medium mb-2">Work Email</label>
                            <InputText id="email" v-model="createUser.email" type="email" placeholder="example@gmail.com" class="w-full" style="padding: 1rem" />
                            <small id="email-help" class="error-report red-text" v-if="errorData.emailError"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Email required! </small>
                        </div>
                        <div class="field md:w-28rem mb-4">
                            <label for="password" class="block text-900 font-medium text-xl mb-2">Password</label>
                            <Password id="password" v-model="createUser.password" placeholder="Password" :toggleMask="true" class="w-full" inputClass="w-full" :inputStyle="{ padding: '1rem' }">
                                <template #header>
                                    <h6>Pick a password</h6>
                                </template>
                                <template #footer>
                                    <Divider />
                                    <p class="mt-2">Suggestions</p>
                                    <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                                        <li>At least one lowercase</li>
                                        <li>At least one uppercase</li>
                                        <li>At least one numeric</li>
                                        <li>Minimum 8 characters</li>
                                    </ul>
                                </template>
                            </Password>
                            <small id="password-help" class="error-report red-text" v-if="errorData.passwordError"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Password required! </small>
                        </div>
                        <div class="field md:w-28rem mb-4">
                            <label for="password2" class="block text-900 font-medium text-xl mb-2">Confirm Password</label>
                            <Password id="password2" v-model="createUser.confirmPass" placeholder="Confirm Password" :feedback="false" :toggleMask="true" class="w-full" inputClass="w-full" :inputStyle="{ padding: '1rem' }"> </Password>
                            <small id="password-help" class="error-report red-text" v-if="errorData.confirmPassError"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Confirm Password required! </small>
                            <small id="password-help" class="error-report red-text" v-if="errorData.confirmPassMismatch"> <InputIcon class="pi pi-exclamation-triangle"></InputIcon> Confirm Password did not match! </small>
                        </div>
                        <Button type="submit" label="Sign Up" :loading="regBtnHandle" class="w-full p-3 text-xl"></Button>
                    </form>
                    <div class="flex flex-wrap items-center justify-between mt-4">
                        Already have an account? &nbsp;<NuxtLink to="/login" class="forgot_pass md:mb-0">Click Here. </NuxtLink>
                        <!-- <nuxt-link to="/" class="forgot_pass">Forgot password?</nuxt-link> -->
                    </div>
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

.error-text {
    color: red;
    margin-top: -17px;
    margin-left: 5px;
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
</style>
