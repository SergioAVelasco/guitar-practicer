// Ejercicio de demo en alphaTex: cromático 1-2-3-4 subiendo por las cuerdas y bajando.
// Formato de nota: traste.cuerda (cuerda 1 = Mi aguda, 6 = Mi grave).
const up = [6, 5, 4, 3, 2, 1]
  .map((s) => `1.${s} 2.${s} 3.${s} 4.${s}`)
  .join(' ')
const down = [1, 2, 3, 4, 5, 6]
  .map((s) => `4.${s} 3.${s} 2.${s} 1.${s}`)
  .join(' ')

// 24 semicorcheas = 1.5 compases de 4/4; se reparten en compases de 16.
const notes = `${up} ${down}`.split(' ')
const bars: string[] = []
for (let i = 0; i < notes.length; i += 16) bars.push(notes.slice(i, i + 16).join(' '))

export const demoTex = `
\\title "Cromático 1-2-3-4"
\\subtitle "Ejercicio de demo"
\\tempo 90
\\track "Guitarra"
\\staff {tabs}
:16 ${bars.join(' | ')}
`
