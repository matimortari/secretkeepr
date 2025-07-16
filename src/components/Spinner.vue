<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <div class="size-20 border-t-4 animate-spin-outer flex items-center justify-center border-t-primary rounded-full">
      <div class="size-16 border-t-4 animate-spin-inner flex items-center justify-center border-t-secondary rounded-full" />
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
