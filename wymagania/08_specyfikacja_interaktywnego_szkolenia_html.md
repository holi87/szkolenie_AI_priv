# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

## 8. **Specyfikacja interaktywnego szkolenia HTML**

### Wymagane funkcje

| Funkcja | Wymaganie minimalne | Kryterium akceptacji |
|---|---|---|
| Nawigacja modułowa | Menu boczne lub górne z modułami i statusem ukończenia | Uczestnik widzi ukończone, aktywne i zablokowane sekcje |
| Ścieżki użytkownika | Wybór S1/S2/S3 na początku szkolenia | System pokazuje moduły obowiązkowe i opcjonalne dla wybranej ścieżki |
| Progres | Zapisywanie postępu lokalnie lub w backendzie `[ZAŁOŻENIE]` | Po odświeżeniu strony uczestnik wraca do ostatniego miejsca |
| Quiz inline | Pytania po sekcjach i modułach | Wynik i feedback pojawiają się od razu po odpowiedzi |
| Test końcowy | Losowanie pytań z banku według ścieżki i trudności | Każdy test ma właściwą liczbę pytań i udział poziomów trudności |
| Scoring | Liczenie punktów, progu, pytań krytycznych i zadań praktycznych | Wynik końcowy pokazuje: %, status, słabe obszary |
| Certyfikat/zaliczenie | Generowany ekran lub PDF zaliczenia `[ZAŁOŻENIE]` | Certyfikat zawiera imię, ścieżkę, datę, wynik i ID zaliczenia |
| Responsywność | Działanie na desktopie, tablecie i telefonie | Brak poziomego scrolla dla szerokości 360 px |
| Dostępność | WCAG 2.1 AA jako cel `[ZAŁOŻENIE]` | Nawigacja klawiaturą, kontrast, tekst alternatywny, focus states |
| Hosting statyczny (GitHub Pages) | Wdrożenie jako GitHub Pages, wersja statyczna z localStorage — wiążące | Szkolenie działa ze statycznych plików serwowanych przez GitHub Pages, bez serwera |
| Opcjonalny backend | API do zapisu wyników i certyfikatów `[ZAŁOŻENIE]` | Wyniki są zapisywane centralnie i możliwe do eksportu CSV |

### Zakres zależności od backendu

| Wariant | Zakres | Zalety | Ograniczenia | Rekomendacja |
|---|---|---|---|---|
| Wariant A: statyczny HTML + JS + localStorage | Progres i wynik zapisane lokalnie | Szybka budowa, brak infrastruktury | Brak centralnego raportowania, łatwiejsze manipulowanie wynikiem | Dobry dla pilotażu |
| Wariant B: statyczny HTML + eksport wyniku | Lokalny wynik + pobieralny plik JSON/CSV/PDF | Nadal prosty, daje artefakt zaliczenia | Sponsor musi zebrać wyniki ręcznie | Dobry dla małej grupy |
| Wariant C: backend wyników | Logowanie, zapis progresu, wyniki, certyfikaty, raporty | Audytowalność i raportowanie | Większy koszt i czas | Rekomendowany dla rollout firmowego |

### Hosting i wdrożenie — GitHub Pages (wiążące)

Docelowy i wiążący model hostingu to **GitHub Pages**. To ograniczenie jest nadrzędne wobec samego wyboru HTML — cała technologia musi działać jako statyczny hosting bez serwera. HTML/CSS/JS/localStorage to konsekwencja modelu Pages, nie cel sam w sobie.

| Wymaganie | Kryterium akceptacji |
|---|---|
| Statyczny hosting | Aplikacja serwowana wyłącznie ze statycznych plików (HTML/CSS/JS/JSON); brak kodu serwerowego w runtime |
| Ścieżki względne | Wszystkie linki do assetów, danych i modułów względne; działa z podścieżki `https://<user>.github.io/<repo>/` |
| Brak backendu na Pages | Progres w `localStorage`; ewentualny backend wyników to zewnętrzny serwis poza Pages, wołany przez HTTPS API |
| Deploy z repo | Publikacja przez branch + folder albo GitHub Actions → Pages; bez serwerowego kroku runtime |
| Zgodność `file://` | Ładowanie `data/*.json` przez `fetch()` działa przez http(s); dla otwarcia przez `file://`/offline wymagany lokalny statyczny serwing lub inline danych |
| Intranet | Dystrybucja wewnętrzna przez GitHub Enterprise Pages lub własny statyczny serwing |

Wariant C (backend wyników) nie jest hostowany na GitHub Pages — pozostaje zewnętrznym serwisem konsumowanym przez statyczny front.

### Elementy interaktywne do zbudowania

| Element | Moduł | Opis działania | Dane wejściowe | Output |
|---|---|---|---|---|
| Klasyfikator zadań | M1 | Drag & drop przykładów zadań do kategorii | Lista 12 zadań | Wynik + uzasadnienie |
| Licznik kontekstu | M2 | Symulacja context window i utraty fragmentów | Tekst wymagań + limit tokenów | Pokazanie, które pytania tracą podstawę |
| Suwaki generacji | M3 | Zmiana parametrów wpływa na przykładowy output | Temperature, top-p, max tokens | Porównanie outputów |
| Mapa semantyczna | M4 | Wizualizacja embeddings 2D | Zapytania i fragmenty tekstu | Najbliższe semantycznie fragmenty |
| Retrieval debugger | M5 | Zmiana top-k i filtrów | Mini-korpus QA | Precision/recall w uproszczeniu |
| Zbuduj pipeline RAG | M6 | Układanie pipeline i konfiguracja chunking | Dokumentacja wymagań | Ocena konfiguracji |
| Prompt clinic | M7 | Poprawa promptów według rubryki | Wadliwe prompty | Feedback element po elemencie |
| QA workbench | M8 | Ocena wygenerowanych przypadków testowych | Wymaganie + output LLM | Braki, ryzyka, duplikaty |
| Agent permission board | M9 | Nadawanie uprawnień agentowi | Zadania i systemy | Ocena ryzyka i kontroli |
| Data safety gate | M10 | Decyzja o danych | Próbki danych | Dozwolone / anonimizuj / zakazane |
| Output verifier | M11 | Oznaczanie zdań outputu | Odpowiedź LLM | Kategorie ryzyka |
| Judge calibration lab | M12 | Porównanie ocen człowieka i LLM-as-a-judge | Odpowiedzi i rubryka | Rozjazdy, bias, poprawiona rubryka |

### Wymagania UX

| Obszar | Wymaganie |
|---|---|
| Język | Całość po polsku; terminy techniczne w oryginale z krótką definicją przy pierwszym użyciu |
| Struktura ekranu | Jeden ekran = jedna decyzja lub jedna koncepcja; bez ścian tekstu dłuższych niż 250–300 słów `[ZAŁOŻENIE]` |
| Feedback | Feedback natychmiastowy po ćwiczeniu, z linkiem do powiązanej sekcji |
| Tryb nauki | Uczestnik może podejrzeć wyjaśnienie po quizie inline |
| Tryb testu | W teście końcowym brak podpowiedzi do czasu zakończenia podejścia |
| Dostępność | Każda interakcja musi mieć alternatywę klawiaturową; drag & drop musi mieć wariant listy wyboru |
| Czytelność | Tabele i diagramy muszą mieć wersję tekstową albo opis alternatywny |
| Motywacja | Pokazywać postęp procentowy i „następny najlepszy krok” |
| Bezpieczeństwo | Przykłady danych muszą być syntetyczne; brak prawdziwych danych klientów |

### Minimalna struktura plików HTML `[ZAŁOŻENIE]`

```text
/genai-llm-training
  index.html
  /assets
    styles.css
    app.js
    quiz-engine.js
    progress-store.js
    certificate.js
  /data
    modules.json
    questions.json
    golden-set.json
    scenarios.json
  /modules
    m01-fundamenty.html
    m02-architektura.html
    m03-parametry.html
    m04-embeddings.html
    m05-vector-db.html
    m06-rag.html
    m07-prompt-engineering.html
    m08-qa-use-cases.html
    m09-agents.html
    m10-security-governance.html
    m11-verification.html
    m12-evaluation.html
```

### Minimalny model danych pytania `[ZAŁOŻENIE]`

```json
{
  "id": "Q081",
  "module": "M10",
  "pillar": "security_governance",
  "paths": ["S1", "S2", "S3"],
  "difficulty": "L2",
  "bloom": "analysis",
  "type": "scenario_single_choice",
  "isCritical": true,
  "learningOutcome": "Klasyfikuje dane jako dozwolone, wymagające anonimizacji albo niedozwolone",
  "prompt": "Uczestnik chce wkleić do publicznego narzędzia LLM fragment zgłoszenia zawierający imię, nazwisko, e-mail i numer klienta. Co powinien zrobić?",
  "options": [
    { "id": "A", "text": "Wkleić bez zmian, jeśli celem jest analiza błędu" },
    { "id": "B", "text": "Zanonimizować dane albo użyć zatwierdzonego narzędzia z odpowiednimi kontrolami" },
    { "id": "C", "text": "Dodać do promptu prośbę, aby model nie zapamiętywał danych" },
    { "id": "D", "text": "Wkleić tylko wtedy, gdy model odpowie, że dane są bezpieczne" }
  ],
  "correct": ["B"],
  "points": 2,
  "feedbackCorrect": "Poprawnie: dane identyfikujące osobę wymagają anonimizacji lub zatwierdzonego środowiska.",
  "feedbackIncorrect": "To błąd bezpieczeństwa: sam prompt nie jest kontrolą ochrony danych.",
  "references": ["M10.2", "M10.4"]
}
```
