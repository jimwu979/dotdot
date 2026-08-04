export const categoryColors = {
  'coral':      '#e37c76',
  'pink':       '#e66f97',
  'blue':       '#6abddf',
  'mint':       '#6fc4aa',
  'lime':       '#94ce60',
  'amber':      '#f5bd62',
  'purple':     '#b883d3',
  'orchid':     '#cf78bd',
  'periwinkle': '#879bea',
  'grey':       '#8f98a8',
} as const

export type CategoryColorId = keyof typeof categoryColors
export type CategoryColorValue = typeof categoryColors[CategoryColorId]

export const categoryColorList: CategoryColorId[] = [
  'coral',
  'pink',
  'blue',
  'mint',
  'lime',
  'amber',
  'purple',
  'orchid',
  'periwinkle',
  'grey',
]
