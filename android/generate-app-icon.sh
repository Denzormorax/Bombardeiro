#!/usr/bin/env bash
set -euo pipefail

SOURCE="bombericon.jpg"
RES="android/app/src/main/res"

if [[ ! -s "$SOURCE" ]]; then
  echo "ERRO: imagem oficial do ícone não encontrada: $SOURCE" >&2
  exit 1
fi

command -v magick >/dev/null 2>&1 || {
  echo "ERRO: ImageMagick não está disponível no runner." >&2
  exit 1
}

read -r WIDTH HEIGHT < <(magick identify -auto-orient -format '%w %h' "$SOURCE")
# A arte é centralizada numa página branca. Este recorte quadrado pega o
# emblema azul completo e elimina as margens externas da página.
SIZE=$(( WIDTH * 390 / 1000 ))
MAX_HEIGHT=$(( HEIGHT * 694 / 1000 ))
if (( SIZE > MAX_HEIGHT )); then SIZE=$MAX_HEIGHT; fi
X=$(( (WIDTH - SIZE) / 2 ))
Y=$(( HEIGHT * 149 / 1000 ))

if (( SIZE <= 0 || X < 0 || Y < 0 || X + SIZE > WIDTH || Y + SIZE > HEIGHT )); then
  echo "ERRO: dimensões inesperadas para o recorte: ${WIDTH}x${HEIGHT}" >&2
  exit 1
fi

CROP="${SIZE}x${SIZE}+${X}+${Y}"
echo "Recortando ícone de $SOURCE: $CROP (imagem original ${WIDTH}x${HEIGHT})"

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
  magick "$SOURCE" -auto-orient -crop "$CROP" +repage \
    -filter Lanczos -resize "${pixels}x${pixels}" -strip "PNG32:$RES/$folder/ic_launcher.png"
  cp "$RES/$folder/ic_launcher.png" "$RES/$folder/ic_launcher_round.png"
  identify "$RES/$folder/ic_launcher.png"
done

echo "Ícones do Bombardeiro gerados em todas as densidades Android."
