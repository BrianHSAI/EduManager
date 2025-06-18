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
- **Mock Data**: Simuleret backend data

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

## Demo Data

Appen kommer med mock data der inkluderer:
- 1 underviser (Lars Hansen)
- 4 elever (Emma, Mikkel, Sofia, Oliver)
- 2 grupper (7A Matematik, 7A Dansk)
- 2 opgaver med forskellige felttyper
- Eksempel besvarelser og hjælp anmodninger

## Navigation

### Underviser Dashboard
- **Oversigt**: Hoveddashboard med statistikker og seneste aktivitet
- **Grupper**: Administrer klasser og elever
- **Opgaver**: Opret og administrer opgaver
- **Hjælp Anmodninger**: Se og besvar elevernes hjælp anmodninger

### Elev Interface
Besøg `/student/1` eller `/student/2` for at se elev interfacet for opgave 1 eller 2.

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
├── mock-data.ts            # Mock data og hjælpefunktioner
├── utils.ts                # Utility funktioner
```

## Bidrag

Dette er en demo applikation. For produktionsklare features, kontakt udvikleren.
