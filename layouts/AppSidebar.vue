<script setup>
import AppMenu from './AppMenu.vue';
const toast = useToast();
 
</script>

<template>
    <app-menu></app-menu>
    <Toast position="bottom-right" group="br" />
</template>

<style lang="scss" scoped></style>
