# EduManager - Underviser App

En omfattende app til undervisere, hvor man kan tildele opgaver til elever, følge deres fremskridt og give hjælp når det er nødvendigt.

## Funktioner

### For Undervisere
- **Dashboard Oversigt**: Se statistikker over grupper, elever, opgaver og hjælp anmodninger
- **Gruppe Administration**: Opret og administrer klasser, tilføj elever via email invitationer
- **Opgave Oprettelse**: Opret tilpassede opgaver med forskellige felttyper:
  - Tekstfelter
  - Tekstområder
  - Talfelter
  - Multiple choice spørgsmål
  - Afkrydsningsfelter
- **Real-time Fremskridt**: Se hvor langt hver elev er kommet med deres opgaver
- **Hjælp System**: Modtag og besvar hjælp anmodninger fra elever
- **Elev Porteføljer**: Se hver elevs samlede arbejde og fremskridt

### For Elever
- **Opgave Interface**: Intuitivt interface til at løse opgaver
- **Gem Arbejde**: Automatisk og manuel gem funktionalitet
- **Hjælp Anmodninger**: "Jeg har brug for hjælp" knap
- **Fremskridt Tracking**: Se hvor langt man er kommet
- **Export Funktioner**: Eksporter arbejde som PDF eller Word dokument

## Teknologi Stack

- **Frontend**: Next.js 14 med App Router
- **Styling**: Tailwind CSS + shadcn/ui komponenter
- **TypeScript**: Fuldt typesikret
- **State Management**: React hooks
- **Data Storage**: Lokal state management (klar til database integration)

## Kom i Gang

1. Installer dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Åbn [http://localhost:3000](http://localhost:3000) i din browser

## Første Gang Setup

Applikationen starter helt forfra uden nogen data:
- Ingen brugere, grupper eller opgaver
- Ren installation klar til brug
- Opret din første underviser profil via login
- Byg dit eget system fra bunden

## Navigation

### Underviser Dashboard
- **Oversigt**: Hoveddashboard med statistikker og seneste aktivitet
- **Grupper**: Administrer klasser og elever
- **Opgaver**: Opret og administrer opgaver
- **Hjælp Anmodninger**: Se og besvar elevernes hjælp anmodninger

### Elev Interface
Elever kan tilgå deres opgaver via direkte links som deles af underviseren.

## Funktionalitet Highlights

### Opgave Oprettelse
- Drag-and-drop interface til at tilføje forskellige felttyper
- Påkrævede/valgfrie felter
- Multiple choice med tilpassede svarmuligheder
- Afleveringsfrister

### Real-time Features
- Live fremskridt tracking
- Automatisk gem funktionalitet
- Øjeblikkelige hjælp anmodninger

### Export Funktioner
- PDF export af elevarbejde
- Word dokument export
- Portefølje oversigter

## Fremtidige Forbedringer

- Real database integration (Supabase)
- Real-time collaboration med WebSockets
- Email notifikationer
- Avanceret rapportering
- Mobile app
- Offline funktionalitet
- Plagiat detektion
- Automatisk bedømmelse

## Arkitektur

```
app/
├── page.tsx                 # Hovedside med dashboard
├── student/[taskId]/        # Elev interface
├── globals.css              # Global styling
components/
├── dashboard-layout.tsx     # Hovedlayout
├── overview-dashboard.tsx   # Dashboard oversigt
├── groups-management.tsx    # Gruppe administration
├── task-management.tsx      # Opgave administration
├── help-requests.tsx        # Hjælp anmodninger
├── student-task-interface.tsx # Elev interface
lib/
├── types.ts                 # TypeScript typer
├── mock-data.ts            # Data management funktioner
├── utils.ts                # Utility funktioner
```

## Deployment til Browseren

Applikationen er allerede bygget til at køre i browseren. For at gøre den tilgængelig online uden installation:

### Vercel Deployment (Anbefalet)

1. Gå til [vercel.com](https://vercel.com) og opret en konto
2. **VIGTIGT**: Konfigurer miljøvariabler før deployment:
   - Gå til Project Settings → Environment Variables
   - Tilføj `NEXT_PUBLIC_SUPABASE_URL` og `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Værdier findes i din Supabase dashboard under Settings → API
3. Klik "New Project" og importer dette repository
4. Vercel vil automatisk detektere Next.js og bygge applikationen
5. Din app vil være tilgængelig på en URL som `https://dit-projekt-navn.vercel.app`

**Note**: Applikationen er konfigureret til at fungere uden Supabase miljøvariabler og vil bruge mock data som fallback.

### Netlify Deployment

1. Gå til [netlify.com](https://netlify.com) og opret en konto
2. Drag og drop `.next` mappen til Netlify Dashboard
3. Eller forbind dit Git repository for automatisk deployment

### Andre Muligheder

- **GitHub Pages**: For statisk hosting
- **Railway**: For fuld-stack deployment
- **Heroku**: For cloud hosting

### Lokal Produktion

For at teste produktions-versionen lokalt:

```bash
npm run build
npm run start
```

Applikationen vil være tilgængelig på [http://localhost:3000](http://localhost:3000)

## Bidrag

Dette er en demo applikation. For produktionsklare features, kontakt udvikleren.
