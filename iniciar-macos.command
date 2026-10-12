#!/bin/bash
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v npm >/dev/null 2>&1; then
  echo "Instale Node.js (com npm) e Git antes de iniciar. Veja docs/inicializacao.md."
  read -r -p "Pressione Enter para fechar... "
  exit 1
fi
npm run conscious:start -- "$@"
result=$?
if [ "$result" -ne 0 ]; then read -r -p "Pressione Enter para fechar... "; fi
exit "$result"
