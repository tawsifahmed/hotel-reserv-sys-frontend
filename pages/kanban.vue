<template>
    <div class="kanban-board">
        <div class="kanban-column">
            <h3>Doing</h3>
            <draggable class="list-group" :list="list1" group="people" @change="log">
                <template v-slot:item="{ element, index }">
                    <div class="list-group-item" :key="element.id">
                        <div
                            style="height: 120px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))"
                        >
                            <div class="p-3 surface-card h-full" style="border-radius: 8px">
                                <div class="flex align-items-center justify-content-center bg-yellow-200" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                    <i class="pi pi-fw pi-users text-2xl text-yellow-700"></i>
                                </div>
                                <h5 class="text-900">{{ index + 1 }}. {{ element.name }}</h5>
                            </div>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>

        <div class="kanban-column">
            <h3>Dev Done</h3>
            <draggable class="list-group" :list="list2" group="people" @change="log">
                <template v-slot:item="{ element, index }">
                    <div class="list-group-item" :key="element.id">
                        <div
                            style="height: 120px; padding: 2px; border-radius: 10px; background: linear-gradient(90deg, rgba(145, 226, 237, 0.2), rgba(251, 199, 145, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(172, 180, 223, 0.2))"
                        >
                            <div class="p-3 surface-card h-full" style="border-radius: 8px">
                                <div class="flex align-items-center justify-content-center bg-cyan-200" style="width: 3.5rem; height: 3.5rem; border-radius: 10px">
                                    <i class="pi pi-fw pi-map text-2xl text-indigo-700"></i>
                                </div>
                                <h5 class="text-900">{{ index + 1 }}. {{ element.name }}</h5>
                            </div>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>

        <rawDisplayer class="raw-displayer" :value="list1" title="List 1" />
        <rawDisplayer class="raw-displayer" :value="list2" title="List 2" />
    </div>
</template>

<script>
import draggable from 'vuedraggable';

export default {
    name: 'KanbanBoard',
    components: {
        draggable
    },
    data() {
        return {
            list1: [
                { name: 'John', id: 1 },
                { name: 'Joao', id: 2 },
                { name: 'Jean', id: 3 },
                { name: 'Gerard', id: 4 }
            ],
            list2: [
                { name: 'Juan', id: 5 },
                { name: 'Edgard', id: 6 },
                { name: 'Johnson', id: 7 }
            ]
        };
    },
    methods: {
        log: function (evt) {
            console.log(evt);
        }
    }
};
</script>

<style scoped>
.kanban-board {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.kanban-column {
    /* background-color: #f0f0f0; */
    padding: 20px;
    border-radius: 5px;
}

.list-group-item {
    margin-bottom: 10px;
}

.box {
    background-color: #ffffff;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
}
</style>
