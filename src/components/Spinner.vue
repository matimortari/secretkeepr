<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <div class="animate-spin-outer flex size-20 items-center justify-center rounded-full border-t-4 border-t-primary">
      <div class="animate-spin-inner flex size-16 items-center justify-center rounded-full border-t-4 border-t-secondary" />
    </div>
  </div>
</template>

<style scoped>
@keyframes spin-outer {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.animate-spin-outer {
  animation: spin-outer 1s linear infinite;
}

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
