<template>
  <main class="flex min-h-screen flex-grow items-center justify-center overflow-x-hidden text-center">
    <slot />
  </main>

  <footer class="py-4 text-center text-sm md:p-8">
    <p>© {{ new Date().getFullYear() }} – SecretKeepR</p>
  </footer>
</template>
