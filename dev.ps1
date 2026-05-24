# .\dev.ps1 init    # scaffold Vite
# .\dev.ps1 dev     # run dev server
# .\dev.ps1 build   # production build
# .\dev.ps1 sh      # interactive shell

# dev.ps1 — Docker Node dev helper
# Run from your project root in PowerShell

# docker-dev.ps1
$cmd = $args[0]
$image = "node:24-slim"

if ($cmd -eq "init") {
    docker run --rm -it -v "${PWD}:/app" -w /app $image sh -c "npm create vite@latest . -- --template react && npm install"
} elseif ($cmd -eq "dev") {
    docker run --rm -it -v "${PWD}:/app" -w /app -p 5173:5173 $image npm run dev -- --host 0.0.0.0
} elseif ($cmd -eq "build") {
    docker run --rm -it -v "${PWD}:/app" -w /app $image npm run build
} elseif ($cmd -eq "sh") {
    docker run --rm -it -v "${PWD}:/app" -w /app $image sh
} else {
    Write-Host "Usage: .\docker-dev.ps1 [init|dev|build|sh]"
}