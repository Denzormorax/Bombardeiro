#!/usr/bin/env bash
set -euo pipefail

SOURCE="Icone do jogo.png"
RES="android/app/src/main/res"

if [[ ! -s "$SOURCE" ]]; then
  echo "ERRO: imagem oficial do ícone não encontrada: $SOURCE" >&2
  exit 1
fi

command -v magick >/dev/null 2>&1 || {
  echo "ERRO: ImageMagick não está disponível no runner." >&2
  exit 1
}

# Usa a área visível da imagem enviada, preservando o ícone quadrado completo.
# O arquivo possui transparência ao redor da arte; -trim remove somente essa margem.
DIMENSIONS="$(magick "$SOURCE" -trim +repage -format '%w %h' info:)"
read -r WIDTH HEIGHT <<< "$DIMENSIONS"

if [[ ! "$WIDTH" =~ ^[0-9]+$ || ! "$HEIGHT" =~ ^[0-9]+$ ]]; then
  echo "ERRO: não foi possível ler as dimensões visíveis da imagem: '$DIMENSIONS'" >&2
  exit 1
fi

if (( WIDTH != HEIGHT )); then
  echo "ERRO: a área visível do novo ícone precisa ser quadrada; encontrada ${WIDTH}x${HEIGHT}." >&2
  exit 1
fi

declare -A DENSITIES=(
  [mipmap-mdpi]=48
  [mipmap-hdpi]=72
  [mipmap-xhdpi]=96
  [mipmap-xxhdpi]=144
  [mipmap-xxxhdpi]=192
)

for folder in "${!DENSITIES[@]}"; do
  pixels="${DENSITIES[$folder]}"
  mkdir -p "$RES/$folder"
  magick "$SOURCE" -trim +repage \
    -filter Lanczos -resize "${pixels}x${pixels}" -strip "PNG32:$RES/$folder/ic_launcher.png"
  cp "$RES/$folder/ic_launcher.png" "$RES/$folder/ic_launcher_round.png"
  magick identify "$RES/$folder/ic_launcher.png"
done

echo "Ícones do Bombardeiro gerados em todas as densidades Android."
