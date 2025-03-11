import { defineStore } from 'pinia';
import apiLink from '../utils/apiLinks';
export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    userCreated: false,
    loading: false,
    userProfile: null,
    detectDuplicateEmail: false,
    resetState: null,
    resetToken: ''
  }),

  actions: {
    async authenticateUser({ email, password }) {
      this.loading = true; // Set loading to true when the request starts
      
      try {
        const { data, error } = await useFetch(`${apiLink}/api/v1/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            email,
            password,
          },
        });

        // Check for errors
        if (error.value) {
          // Handle 401 error (unauthorized)
          if (error.value?.data?.code === 401) {
            this.authenticated = false;
            console.error("Authentication failed. Invalid credentials.");
          }
          return;
        }

        // If response contains valid data
        if (data.value && data.value.code === 200) {
          const token = useCookie('token');
          token.value = data.value?.access_token;
          this.authenticated = true;
          console.log('User authenticated successfully:', data.value);
        } else {
          this.authenticated = false;
          const token = useCookie('token');
          token.value = '';
          console.error("Authentication failed. Invalid response.");
        }
      } catch (error) {
        console.error("An error occurred during login:", error);
      } finally {
        this.loading = false; // Set loading to false after request completion
      }
    },

    // Register user and handle errors
    async registerUser({ userName, email, password, confirmPass }) {
      this.loading = true; // Set loading to true when the request starts
      
      try {
        const { data, error } = await useFetch(`${apiLink}/api/v1/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            name: userName,
            email: email,
            password: password,
            password_confirmation: confirmPass,
          },
        });

        // Check for duplicate email (422 error)
        if (error.value?.data?.code === 422) {
          this.detectDuplicateEmail = true;
          this.userCreated = false;
          console.error("Email is already registered.");
          return;
        }

        // If registration is successful
        if (data.value?.code === 201) {
          this.detectDuplicateEmail = false;
          this.userCreated = true;
          console.log('User created successfully:', data.value);
          // Automatically log the user in after successful registration
          await this.authenticateUser({ email, password });
            window.location.reload();
        }
      } catch (error) {
        console.error("An error occurred during registration:", error);
      } finally {
        this.loading = false; // Set loading to false after request completion
      }
    },
    async forgotPassword(email) {
      const { data, error, pending } = await useFetch(`${apiLink}/api/v1/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email
        },
      });
      if (data.value) {
        return { code: 200, message: 'otp' }
      } else {
        return { code: error.value.status, message: error.value.data.message };
      }
    },
    async forgotPasswordOtp(email, otp) {
      const { data, error, pending } = await useFetch(`${apiLink}/api/v1/forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email,
          otp
        },
      });
      if (data.value) {
        this.resetToken = data.value.token;
        return { code: 200, message: 'new-password' }
      } else {
        return { code: error.value.status, message: error.value.data.message };
      }
    },
    async passwordReset(email, password) {
      const token = useCookie('token');
      const authToken = token.value ? token.value : this.resetToken;
      console.log('token', token.value)
      console.log('this.resetToken', this.resetToken)
      const { data, error, pending } = await useFetch(`${apiLink}/api/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: {
          email,
          password: password.value.password,
          password_confirmation: password.value.confirm_password
        },
      });
      if (data.value) {
        this.resetToken = '';
        return { code: 200, message: 'Password Changed' }
      } else {
        return { code: error.value.status, message: error.value.data.message };
      }
    },
    logUserOut() {
      const token = useCookie('token');
      this.authenticated = false;
      token.value = null;
    },
  },
});
