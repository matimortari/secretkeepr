<template>
  <nav class="absolute top-0 left-0 z-50 w-full p-4">
    <div to="/" class="hover:scale-sm flex flex-row items-center justify-center gap-2 transition-all select-none">
      <img src="/assets/logo.png" alt="Logo" width="35" height="35">
      <span class="font-display text-2xl">SecretKeepR</span>
    </div>
  </nav>

  <main class="bg-image min-h-screen overflow-hidden">
    <slot />
  </main>

  <Footer />
</template>

<script setup lang="ts">
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll)
})
</script>
