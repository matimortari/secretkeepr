<template>
  <div class="flex min-h-screen flex-col">
    <main class="flex flex-grow items-center justify-center text-center">
      <slot />
    </main>

    <footer class="py-4 text-center text-sm">
      <p>© {{ new Date().getFullYear() }} – SecretKeepR</p>
    </footer>
  </div>
</template>
