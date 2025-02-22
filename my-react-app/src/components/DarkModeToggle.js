import React from 'react'
import { Moon, Sun } from 'lucide-react' // shadcn uses lucide icons
import { Button } from '../ui/button'
import { useTheme } from '../ThemeProvider'

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="outline" onClick={toggleTheme}>
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  )
}
