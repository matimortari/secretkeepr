import logoTitleDark from "~/assets/logo-title-dark.png"
import logoTitleLight from "~/assets/logo-title-light.png"

export function useTheme() {
  const colorMode = useState<"dark" | "light">("theme", () => "dark")
  const storageKey = "nuxt-color-mode"

  const updateHtmlClass = () => {
    const html = document.documentElement
    html.classList.remove("dark", "light")
    html.classList.add(colorMode.value)
  }

  const syncThemeFromLocalStorage = () => {
    const saved = localStorage.getItem(storageKey)
    if (saved === "light" || saved === "dark") {
      colorMode.value = saved
    }
    else {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches
      colorMode.value = prefersLight ? "light" : "dark"
    }
    updateHtmlClass()
  }

  const toggleTheme = () => {
    colorMode.value = colorMode.value === "light" ? "dark" : "light"
    localStorage.setItem(storageKey, colorMode.value)
    updateHtmlClass()
  }

  onMounted(() => {
    syncThemeFromLocalStorage()
  })

  const themeIcon = computed(() =>
    colorMode.value === "light" ? "ph:moon-stars-bold" : "ph:sun-horizon-bold",
  )

  const themeTitle = computed(() =>
    colorMode.value === "light" ? logoTitleLight : logoTitleDark,
  )

  return {
    colorMode,
    toggleTheme,
    themeIcon,
    themeTitle,
  }
}
