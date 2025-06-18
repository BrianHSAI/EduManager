# Deployment Guide - EduManager

Denne guide viser hvordan du får EduManager applikationen online, så den kan køre i browseren uden installation.

## 🚀 Hurtig Deployment (Anbefalet)

### Vercel (Gratis og Nemt)

1. **Opret Vercel konto**
   - Gå til [vercel.com](https://vercel.com)
   - Log ind med GitHub, GitLab eller email

2. **Konfigurer miljøvariabler (VIGTIGT)**
   - Før deployment, gå til Project Settings → Environment Variables
   - Tilføj følgende variabler:
     - `NEXT_PUBLIC_SUPABASE_URL`: Din Supabase projekt URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Din Supabase anonymous key
   - Disse findes i din Supabase dashboard under Settings → API

3. **Deploy applikationen**
   - Klik "New Project"
   - Importer dette repository (eller upload filerne)
   - Vercel detekterer automatisk Next.js
   - Klik "Deploy"

3. **Din app er online!**
   - Du får en URL som: `https://dit-projekt-navn.vercel.app`
   - Applikationen er nu tilgængelig for alle i browseren

### Netlify (Alternativ)

1. **Opret Netlify konto**
   - Gå til [netlify.com](https://netlify.com)
   - Log ind med GitHub eller email

2. **Deploy applikationen**
   - Kør `npm run build` lokalt
   - Drag og drop `.next` mappen til Netlify
   - Eller forbind dit Git repository

## 🔧 Andre Deployment Muligheder

### GitHub Pages
- Gratis hosting for statiske sider
- Kræver ekstra konfiguration for Next.js

### Railway
- Fuld-stack hosting
- Understøtter databaser

### Heroku
- Cloud platform
- Gratis tier tilgængelig

## 📱 Progressive Web App (PWA)

For at gøre applikationen "installerbar" som en app:

1. Tilføj PWA manifest
2. Implementer service worker
3. Brugere kan "installere" appen fra browseren

## 🌐 Tilgængelighed

Når applikationen er deployed:

- **Lærere** kan tilgå: `https://din-url.com/teacher`
- **Elever** kan tilgå: `https://din-url.com/student`
- **Login** side: `https://din-url.com/login`

## 🔒 Sikkerhed

For produktion, husk at:

- Aktivér HTTPS (automatisk på Vercel/Netlify)
- Implementer rigtig autentificering når database tilføjes
- Konfigurer CORS korrekt
- Tilføj miljøvariabler hvis nødvendigt

## 📊 Overvågning

Efter deployment kan du:

- Se besøgsstatistikker på hosting platformen
- Implementere analytics (Google Analytics, etc.)
- Overvåge performance og fejl

## 🆘 Fejlfinding

Hvis deployment fejler:

1. **"supabaseUrl is required" fejl**:
   - Sørg for at miljøvariablerne er konfigureret korrekt i Vercel
   - Tjek at `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY` er sat
   - Genstart deployment efter at have tilføjet miljøvariabler

2. **Build fejler lokalt**:
   - Tjek at `npm run build` virker lokalt
   - Sørg for at `.env.local` filen indeholder de korrekte værdier

3. **Andre fejl**:
   - Se deployment logs på hosting platformen
   - Kontakt support hvis nødvendigt

**Note**: Applikationen er konfigureret til at fungere uden Supabase miljøvariabler og bruger mock data som standard, men for fuld funktionalitet skal miljøvariablerne være konfigureret.

## 💡 Tips

- **Gratis hosting**: Vercel og Netlify har generøse gratis tiers
- **Custom domæne**: Kan tilføjes på de fleste platforme
- **Automatisk deployment**: Forbind Git repository for automatiske updates
- **Preview URLs**: Test ændringer før de går live

---

**Resultat**: Din EduManager app kører nu i browseren og kan tilgås af alle uden installation! 🎉
