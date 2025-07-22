<template>
  <div class="flex flex-col items-center justify-center gap-4 p-8">
    <div class="flex size-16 animate-spin items-center justify-center rounded-full border-t-4 border-t-primary" />
  </div>
</template>

<style scoped>
@keyframes spin-inner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
.animate-spin-inner {
  animation: spin-inner 1.5s linear infinite;
}
</style>
