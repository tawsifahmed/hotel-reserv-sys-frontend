<script setup></script>

<template>
    <NuxtLayout>
        <NuxtLoadingIndicator/>
        <NuxtPage />
    </NuxtLayout>
</template>

<style lang="scss">
.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}
.layout-enter-from,
.layout-leave-to {
  filter: grayscale(1);
}

::-webkit-scrollbar{
  display: none;
}

</style>
