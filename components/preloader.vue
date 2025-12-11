<script setup lang="ts">
const preloaderRef = ref()

onMounted(() => {
  const fadeEffect = setInterval(() => {
    if (unref(preloaderRef)) {
      if (!unref(preloaderRef).style.opacity) {
        unref(preloaderRef).style.opacity = 1
      }

      if (unref(preloaderRef).style.opacity > 0) {
        unref(preloaderRef).style.opacity -= 0.1
      }
      else {
        clearInterval(fadeEffect)

        unref(preloaderRef).classList.add('hide')
      }
    }
  }, 200)
})
</script>

<template>
  <div
    ref="preloaderRef"
    class="preloader fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-brown transition-opacity duration-300 z-50"
  >
    <span class="loader" />
  </div>
</template>

<style scoped>
.hide {
  display: none !important;
}
.loader {
  width: 15px;
  aspect-ratio: 1;
  background: green;
  border-radius: 50%;
  animation: l6 1s infinite linear alternate;
}
@keyframes l6 {
  0% {
    box-shadow:
      15px 0,
      -25px 0;
  }
  50% {
    box-shadow:
      15px 0,
      -15px 0;
  }
  100% {
    box-shadow:
      25px 0,
      -15px 0;
  }
}
</style>
