<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-grow flex items-center justify-center text-center">
      <slot />
    </main>

    <footer class="py-4 text-center text-sm">
      <p>© {{ new Date().getFullYear() }} – SecretKeepR</p>
    </footer>
  </div>
</template>
