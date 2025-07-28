<template>
  <section
    v-motion class="flex flex-col items-center gap-8 p-12 text-center"
    :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 800 }"
  >
    <h1
      v-motion class="font-goldman"
      :initial="{ opacity: 0, y: 20 }" :visible="{ opacity: 1, y: 0 }"
      :transition="{ duration: 800 }"
    >
      Command-line Interface – SecretKeepR
    </h1>
  </section>

  <section
    v-motion
    class="flex w-full flex-col gap-8 p-12 text-center md:text-start"
    :initial="{ opacity: 0, y: 40 }"
    :visible="{ opacity: 1, y: 0 }"
    :transition="{ duration: 800 }"
  >
    <div class="flex flex-col items-center justify-between gap-8 md:flex-row">
      <div class="relative flex w-full max-w-xl gap-4 text-start">
        <div
          class="flex cursor-pointer flex-row gap-4 rounded-lg bg-[#0d1117] p-4 font-mono transition-all hover:translate-x-1 hover:shadow-lg"
          title="Copy to clipboard"
          @click="copyToClipboard(installCommand)"
        >
          <span>{{ installCommand }}</span>
        </div>
      </div>
    </div>

    <div class="flex w-full flex-col items-center gap-4">
      <p class="text-muted-foreground">
        After installing, run the following commands to get started:
      </p>

      <div
        class="relative w-full max-w-4xl cursor-pointer rounded-lg bg-[#0d1117] p-4 text-start font-mono transition-all hover:translate-x-1 hover:shadow-lg"
        title="Copy to clipboard"
        @click="copyToClipboard(cliCommands.join('\n'))"
      >
        <span v-for="(cmd, index) in cliCommands" :key="index" class="block">
          {{ cmd }}
        </span>

        <div class="absolute bottom-2 right-2 z-10 flex select-none items-end gap-2 font-semibold text-muted-foreground">
          <span>Powered by Go</span>
          <img src="/gopher.png" width="60" height="60">
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const installCommand = "go install github.com/matimortari/secretkeepr/cli@latest"

const cliCommands = [
  "secretkeepr login",
  "secretkeepr create org my-org",
  "secretkeepr create project my-project",
  "secretkeepr add secret MY_SECRET my-secret-value",
]

function copyToClipboard(val: string) {
  if (val)
    navigator.clipboard.writeText(val)
}

useHead({
  title: "Command-Line Interface – SecretKeepR",
  link: [{ rel: "canonical", href: "https://secretkeepr.vercel.app/cli" }, { rel: "icon", href: "/favicon.ico" }],
  meta: [{ name: "description", content: "The guide for the command-line interface for SecretKeepR, powered by Go." }],
})

useSeoMeta({
  title: "Command-Line Interface – SecretKeepR",
  description: "The guide for the command-line interface for SecretKeepR, powered by Go.",
})
</script>
