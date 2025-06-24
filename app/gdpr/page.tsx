"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function GDPRPage() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={handleBackToHome}
            className="flex items-center space-x-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Tilbage til forsiden</span>
          </Button>
        </div>

        {/* GDPR og persondata */}
        <div className="mt-8">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">GDPR og persondata</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="text-left space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Databeskyttelseserklæring</h2>
                  <p className="text-sm text-gray-600 mb-4">Sidst opdateret: 24/6-2025</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Introduktion</h3>
                  <p className="text-gray-700 leading-relaxed">
                    HomeworkDelight ("vi", "os", "vores") respekterer dit privatliv og er forpligtet til at beskytte dine personoplysninger. Denne databeskyttelseserklæring forklarer, hvordan vi indsamler, bruger og beskytter dine oplysninger, når du bruger vores platform.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    Vores platform hjælper lærere med at støtte elever i at skrive afleveringer og giver elever den hjælp og støtte, de har brug for i deres akademiske arbejde.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Dataansvarlig</h3>
                  <p className="text-gray-700">HomeworkDelight</p>
                  <p className="text-gray-700">Email: kontakt@brianhs.dk</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Hvilke personoplysninger indsamler vi?</h3>
                  <p className="text-gray-700 mb-3">Vi indsamler følgende personoplysninger:</p>
                  
                  <div className="ml-4">
                    <h4 className="font-semibold mb-2">3.1 Oplysninger du giver os</h4>
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      <li>Email-adresse: Bruges til oprettelse af konto og login</li>
                      <li>Brugerindhold: Tekst, opgaver og andet indhold du deler på platformen</li>
                    </ul>

                    <h4 className="font-semibold mb-2 mt-4">3.2 Automatisk indsamlede oplysninger</h4>
                    <ul className="list-disc ml-6 space-y-1 text-gray-700">
                      <li>Cookies: Vi bruger cookies til at forbedre din brugeroplevelse (se afsnit 6)</li>
                      <li>Tekniske data: IP-adresse, browsertype og besøgsdata for at sikre platformens funktion</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">4. Hvorfor behandler vi dine personoplysninger?</h3>
                  <p className="text-gray-700 mb-3">Vi behandler dine personoplysninger baseret på følgende juridiske grundlag:</p>
                  
                  <div className="ml-4 space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">4.1 Kontraktopfyldelse (GDPR art. 6, stk. 1, litra b)</h4>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Levering af vores uddannelsesplatform</li>
                        <li>Opretholdelse af din brugerkonto</li>
                        <li>Kommunikation relateret til tjenesten</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">4.2 Legitime interesser (GDPR art. 6, stk. 1, litra f)</h4>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Forbedring af vores tjenester</li>
                        <li>Sikkerhed og forebyggelse af misbrug</li>
                        <li>Teknisk drift og vedligeholdelse</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">4.3 Samtykke (GDPR art. 6, stk. 1, litra a)</h4>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Cookies (se afsnit 6)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">5. Hvor længe opbevarer vi dine data?</h3>
                  <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    <li>Brugerdata: Opbevares så længe din konto er aktiv</li>
                    <li>Inaktive konti: Data slettes automatisk efter 2 år uden aktivitet</li>
                    <li>Cookies: Se afsnit 6 for specifikke opholdstider</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">6. Cookies</h3>
                  <p className="text-gray-700 mb-3">Vi bruger cookies til at forbedre din oplevelse på vores platform:</p>
                  
                  <div className="ml-4 space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">6.1 Nødvendige cookies</h4>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Session cookies: Opretholder din login-session</li>
                        <li>Sikkerhedscookies: Beskytter mod CSRF-angreb</li>
                        <li>Holdbarhed: Slettes når du lukker browseren</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">6.2 Funktionelle cookies</h4>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Indstillingscookies: Husker dine præferencer</li>
                        <li>Holdbarhed: Op til 1 år</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mt-3">
                    Du kan administrere cookies gennem din browsers indstillinger, men bemærk at deaktivering af visse cookies kan påvirke platformens funktionalitet.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">7. Deling af personoplysninger</h3>
                  <p className="text-gray-700 mb-3">Vi deler ikke dine personoplysninger med tredjeparter, undtagen:</p>
                  
                  <div className="ml-4 space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">7.1 Tjenesteudbydere</h4>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Supabase: Vores database-udbyder, der opbevarer dine data sikkert i EU</li>
                        <li>Data deles kun i det omfang, der er nødvendigt for at levere vores tjeneste</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">7.2 Juridiske krav</h4>
                      <p className="text-gray-700">Vi kan dele oplysninger, hvis det er påkrævet ved lov eller for at beskytte vores juridiske rettigheder.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">8. Datasikkerhed</h3>
                  <p className="text-gray-700 mb-3">Vi implementerer passende tekniske og organisatoriske foranstaltninger for at beskytte dine personoplysninger:</p>
                  <ul className="list-disc ml-6 space-y-1 text-gray-700">
                    <li>Krypteret datatransmission (HTTPS)</li>
                    <li>Sikker database-hosting i EU via Supabase</li>
                    <li>Regelmæssige sikkerhedsopdateringer</li>
                    <li>Adgangskontrol til personoplysninger</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">9. Dine rettigheder</h3>
                  <p className="text-gray-700 mb-3">Under GDPR har du følgende rettigheder:</p>
                  
                  <div className="ml-4 space-y-2">
                    <div>
                      <h4 className="font-semibold">9.1 Ret til indsigt (art. 15)</h4>
                      <p className="text-gray-700">Du kan anmode om en kopi af alle personoplysninger, vi behandler om dig.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">9.2 Ret til berigtigelse (art. 16)</h4>
                      <p className="text-gray-700">Du kan anmode om rettelse af unøjagtige eller ufuldstændige oplysninger.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">9.3 Ret til sletning (art. 17)</h4>
                      <p className="text-gray-700">Du kan anmode om sletning af dine personoplysninger under visse omstændigheder.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">9.4 Ret til begrænsning (art. 18)</h4>
                      <p className="text-gray-700">Du kan anmode om begrænsning af behandlingen af dine oplysninger.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">9.5 Ret til dataportabilitet (art. 20)</h4>
                      <p className="text-gray-700">Du kan anmode om at få udleveret dine data i et struktureret, maskinlæsbart format.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">9.6 Ret til indsigelse (art. 21)</h4>
                      <p className="text-gray-700">Du kan gøre indsigelse mod behandling baseret på legitime interesser.</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Sådan udøver du dine rettigheder:</h4>
                    <p className="text-gray-700">Kontakt os på kontakt@brianhs.dk med din anmodning. Vi svarer inden for 30 dage.</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">10. Klageadgang</h3>
                  <p className="text-gray-700 mb-3">Du har ret til at indgive klage til Datatilsynet, hvis du mener, vi ikke overholder reglerne for behandling af personoplysninger:</p>
                  <div className="text-gray-700">
                    <p>Datatilsynet</p>
                    <p>Borgergade 28, 5.</p>
                    <p>1300 København K</p>
                    <p>Tlf.: 33 19 32 00</p>
                    <p>Email: dt@datatilsynet.dk</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">11. Kontakt os</h3>
                  <p className="text-gray-700 mb-2">Hvis du har spørgsmål om denne databeskyttelseserklæring eller vores behandling af personoplysninger, kan du kontakte os:</p>
                  <p className="text-gray-700">Email: kontakt@brianhs.dk</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">12. Ændringer til denne erklæring</h3>
                  <p className="text-gray-700">Vi kan opdatere denne databeskyttelseserklæring fra tid til anden. Væsentlige ændringer vil blive kommunikeret via email eller gennem en meddelelse på platformen.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
