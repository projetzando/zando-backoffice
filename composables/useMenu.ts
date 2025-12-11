export default function useMenu() {
  const activeMenu = useState<string>(() => '')

  const activeChild = useState<string>(() => '')

  const loadStateFromLocalStorage = () => {
    activeMenu.value = localStorage.getItem('activeMenu') || ''

    activeChild.value = localStorage.getItem('activeChild') || ''
  }

  const toggleMenu = (menu: string) => {
    activeMenu.value = activeMenu.value === menu ? '' : menu

    localStorage.setItem('activeMenu', activeMenu.value)
  }

  const setActiveChild = (parent: string) => {
    activeChild.value = parent

    localStorage.setItem('activeMenu', parent)

    localStorage.setItem('activeChild', parent)
  }

  const resetMenuState = () => {
    activeMenu.value = ''
    activeChild.value = ''
    localStorage.removeItem('activeMenu')
    localStorage.removeItem('activeChild')
  }

  onMounted(loadStateFromLocalStorage)

  return {
    activeMenu,
    activeChild,
    toggleMenu,
    resetMenuState,
    setActiveChild,
  }
}
