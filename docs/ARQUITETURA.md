# Arquitetura do Bombardeiro

## Regras permanentes

1. A pasta `android/` contém somente o invólucro Android/WebView e a configuração de compilação.
2. `bombardeirojogo.html` mantém a estrutura visual e a integração geral do jogo enquanto a migração é feita por etapas.
3. Recursos locais ficam em `game-assets/` e são incluídos no manifesto SHA-256 do APK.
4. A lógica específica de cada inimigo novo deve ficar em `game-assets/scripts/enemies/<inimigo>.js`.
5. Um módulo de inimigo não deve inicializar, alterar ou depender diretamente das telas de abertura, menu ou seleção de fases.
6. O motor principal fornece ao módulo somente uma API controlada para mapa, colisões, movimento, bombas, animações e estado da partida.
7. Cada chamada de módulo de inimigo deve ser protegida por tratamento de erro. Uma falha de IA não pode interromper a inicialização do aplicativo nem as telas de navegação.
8. Antes de gerar APK, o fluxo deve verificar a sintaxe de todos os JavaScripts e executar os testes automatizados.
9. Mecânicas aprovadas, física, colisões, IA existente, áudio, sprites, cache e desempenho devem ser preservados.

## Módulo atual

- `game-assets/scripts/enemies/builder.js`: planejamento do escudo, escolha do recuo, construção, animação e estados do inimigo construtor do Deserto.
- `tests/builder-shield.test.js`: testes dos quatro sentidos cardeais, obstáculos, casas ocupadas, recuo lateral, construção e cancelamento seguro.

O HTML carrega o módulo como JavaScript clássico local, sem rede e sem depender de importação dinâmica. A chamada do módulo é protegida no motor para que uma exceção específica do construtor não derrube a execução geral.

## Próximas etapas de modularização

1. Estabilizar e validar o módulo do construtor no APK e no aparelho.
2. Extrair os próximos comportamentos de inimigos para arquivos próprios, seguindo o mesmo contrato.
3. Separar progressivamente inicialização/abertura, menu, seleção de mundos/fases e motor da partida, sem reescrever tudo de uma vez.
4. Adicionar testes de fumaça para abertura, menu, seleção de fases e entrada na partida antes de cada APK.

## Critério de aceitação

Uma atualização só é considerada pronta para teste no celular quando:
- os testes automatizados passam;
- a sintaxe dos scripts passa;
- o APK compila e o artefato é conferido;
- a abertura, menu, seleção de fases e entrada na partida permanecem preservados;
- o comportamento novo é testado separadamente no jogo.
