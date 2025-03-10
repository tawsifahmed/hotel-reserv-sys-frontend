<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import { useLayout } from './composables/layout';
import { useRoute } from 'vue-router';
import Dialog from 'primevue/dialog';

const route = useRoute();
const { layoutConfig, layoutState, setActiveMenuItem, onMenuToggle } = useLayout();
const props = defineProps({
    item: {
        type: Object,
        default: () => ({})
    },
    index: {
        type: Number,
        default: 0
    },
    root: {
        type: Boolean,
        default: true
    },
    parentItemKey: {
        type: String,
        default: null
    }
});
const isActiveMenu = ref(false);
const itemKey = ref(null);
const visibleCreateCompany = ref(false);
const visibleCreateSpace = ref(false)

onBeforeMount(() => {
    itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index);
    const activeItem = layoutState.activeMenuItem;

    isActiveMenu.value = activeItem === itemKey.value || activeItem ? activeItem.startsWith(itemKey.value + '-') : false;
});
watch(
    () => layoutConfig.activeMenuItem.value,
    (newVal) => {
        isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
    }
);

const itemClick = (event, item) => {
    if (item.disabled) {
        event.preventDefault();

        return;
    }

    if (item?.label === "Company") {
        visibleCreateCompany.value = true;
        event.preventDefault(); // Prevent default navigation for this special case
        return;
    }

    if (item?.label === "Space") {
        visibleCreateSpace.value = true;
        event.preventDefault(); // Prevent default navigation for this special case
        return;
    }

    const { overlayMenuActive, staticMenuMobileActive } = layoutState;

    if ((item.to || item.url) && (staticMenuMobileActive.value || overlayMenuActive.value)) {
        onMenuToggle();
    }

    if (item.command) {
        item.command({ originalEvent: event, item: item });
    }

    const foundItemKey = item.items ? (isActiveMenu.value ? props.parentItemKey : itemKey) : itemKey.value;

    setActiveMenuItem(foundItemKey);
};

const checkActiveRoute = (item) => {
    return route.path === item.to;
};
</script>

<template>
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
        <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">
            {{ item.label }}
        </div>
        <Dialog v-model:visible="visibleCreateCompany" modal header=" " :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <CreateCompany/>
        </Dialog>
        <Dialog v-model:visible="visibleCreateSpace" modal header=" " :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
            <CreateSpace />
        </Dialog>
        <a v-if="(!item.to || item.items) && item.visible !== false" :href="item.url" @click="itemClick($event, item, index)" :class="item.class" :target="item.target" tabindex="0">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i v-if="item.items" class="pi pi-fw pi-plus layout-submenu-toggler"></i>
        </a>
        <router-link v-if="item.to && !item.items && item.visible !== false" @click="itemClick($event, item, index)" :class="[item.class, { 'active-route': checkActiveRoute(item) }]" tabindex="0" :to="item.to">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i v-if="item.items" class="pi pi-fw pi-angle-down layout-submenu-toggler"></i>
        </router-link>
        <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
            <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
                <app-menu-item v-for="(child, i) in item.items" :key="child" :index="i" :item="child" :parentItemKey="itemKey" :root="false"></app-menu-item>
            </ul>
        </Transition>
    </li>
</template>

<style lang="scss" scoped></style>