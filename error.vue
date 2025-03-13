<script setup>
defineProps(['error'])

const route = useRoute();

// const error = useError();

// the error object has the following properties:
//  {
//   statusCode: Number;
//   statusMessage: String;
//   message: String;
// }

const handleError = () => {
  clearError({
    redirect: '/',
  });
};

</script>
<template>
    <div class="max-w-sm mx-auto text-center flex flex-column align-items-center justify-content-center h-screen card">
      <!-- <div>Full Path: {{ route.fullPath }} </div>
      <div>Path: {{ route.path }} </div>  
      <div>Params: {{ route.params }} </div>
      <div>Page Name: {{ route.name }} </div> -->
        <p class="text-7xl font-bold mb-0">{{error.statusCode}}</p>
        <p class="text-6xl mb-0" style="line-height: 1;">Ops</p>
        <i class="mt-3">
            <b>
                {{error.message}}
            </b>
        </i>
        <p @click="handleError" class="cursor-pointer  mt-4 bg-primary hover:bg-red-600 transition-all duration-100 text-white text-lg w-[fit-content] px-6 py-2 rounded-lg"> Go back to 
            <a >
                Home
              </a>
        </p>

    </div>
</template>

<style  scoped>

</style>