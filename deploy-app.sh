export HOST=iiset.io

# Preserve any local changes (e.g. pricing page, deploy fixes) before pulling
git add -A
git commit -m "deploy: preserve local changes" || true

git pull openclaw main || true

docker-compose up -d --build app && docker-compose rm -f app && docker-compose up -d app
