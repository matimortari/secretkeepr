<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4">
    <div class="progress-bar w-1/4 bg-muted">
      <div class="progress bg-primary" />
    </div>
  </div>
</template>

<style scoped>
.progress {
  height: 4px;
  transition: 0.5s;
  animation: animate-loading 2s ease infinite;
}

@keyframes animate-loading {
  0% {
    width: 0%;
  }
  10% {
    width: 10%;
  }
  50% {
    width: 40%;
  }
  60% {
    width: 60%;
  }
  100% {
    width: 100%;
  }
}
</style>
