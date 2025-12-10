```
# Backend — Phase A (scaffold)

1. cp .env.example .env -> remplir
2. npm install
3. npx prisma migrate dev --name init
4. npm run dev

Pour le dev local: tu peux utiliser l'entête HTTP `x-tenant-slug: <slug>` afin de simuler le sous-domaine.
```
