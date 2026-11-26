# Mundo 6 — Mundo dos Diamantes

Dez fases com identidade cromática própria. O atlas contém 40 peças SVG em uma grade de 4 colunas por 10 linhas: piso, detalhe mineral, bloco indestrutível e geodo destrutível.

## Diferença obrigatória entre os blocos

- **Indestrutível — muralha mineral blindada:** silhueta quadrada e maciça, placas em camadas, moldura reforçada, cantos rebitados e sulcos. Deve parecer uma fortificação pesada, nunca uma pedra preciosa solta.
- **Destrutível — geodo cristalino rachado:** silhueta irregular de rocha fraturada, cristais pontiagudos saindo para fora e núcleo luminoso facetado. Deve parecer quebrável e diferente da muralha.
- Os dois modelos mantêm profundidade 3D, luz superior, faces laterais sombreadas e cores próprias da fase.

| Fase | Tema |
|---|---|
| 1. Diamante Azul-Glacial | Glaciar Celeste |
| 2. Rubi Vermelho | Coração Carmesim |
| 3. Esmeralda Verde | Jardim Esmeralda |
| 4. Safira Azul | Abismo Safira |
| 5. Ametista Roxa | Catedral Violeta |
| 6. Ouro Dourado | Palácio Áureo |
| 7. Quartzo Rosa | Jardim Rosé |
| 8. Obsidiana Negra | Fortaleza Ônix |
| 9. Turquesa | Oásis Turquesa |
| 10. Opala Arco-Íris | Santuário Prismático |

## Integração e desempenho

- Carregar o atlas uma única vez e preparar os sprites em cache.
- Preservar colisões e regras existentes; o geodo destrutível usa o mesmo comportamento dos blocos destrutíveis atuais.
- Renderizar chão e efeitos do cenário antes de personagens, inimigos, bombas e entidades de primeiro plano.
- Não alterar física, IA, bombas, dano ou progressão.
- A fase 10 é reservada ao confronto final; não adiciona inimigos nem altera IA nesta etapa.

## Atlas

[Ver atlas SVG](../game-assets/sprites/diamond_themes.svg)
