<script setup>
import { useLayout } from './composables/layout';
import { computed } from 'vue';
const { layoutConfig } = useLayout();
const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});
</script>

<template>
    <div class="layout-footer">
        <img title="Hotel Reservation System" class="footer-logo" src="/demo/images/login/avatar.png" alt="Logo" height="20" class="mr-2" />
        by<a class="font-medium" href="https://www.github.com/tawsifahmed" target="_blank" >Tawsif Ahmed Riyad</a>
    </div>
</template>
<style lang="scss" scoped>
.font-medium{
    margin-left: 0.35rem !important;
    font-size: small;
    color: black;
}
</style>
