export type PanelSection = 'original' | 'people' | 'facility' | 'visits' | 'payment'
export const panelSectionId = (s: PanelSection) => `panel-sec-${s}`
