import { useEffect } from 'react'

export function useTanStackTableHover(deps = null, containerSelector = '') {
  useEffect(() => {
    const container = containerSelector
      ? document.querySelector(containerSelector)
      : document

    if (!container) return

    const handleMouseOver = (e) => {
      const cell = e.target.closest('[data-column-id]')
      if (!cell) return

      const colId = cell.getAttribute('data-column-id')
      if (!colId) return

      container
        .querySelectorAll(`[data-column-id="${colId}"]`)
        .forEach((el) => {
          el.classList.add('hovered_column')
        })
    }

    const handleMouseOut = () => {
      container
        .querySelectorAll('.hovered_column')
        .forEach((el) => el.classList.remove('hovered_column'))
    }

    container.addEventListener('mouseover', handleMouseOver)
    container.addEventListener('mouseout', handleMouseOut)

    return () => {
      container.removeEventListener('mouseover', handleMouseOver)
      container.removeEventListener('mouseout', handleMouseOut)
    }
  }, [deps, containerSelector])
}
