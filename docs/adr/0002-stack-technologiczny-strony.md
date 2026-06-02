# ADR-0002: Stack technologiczny strony szkolenia (Solution Architect)

| Pole | Wartość |
|---|---|
| Status | Zaakceptowana — refine ADR-0001 (nie zastępuje) |
| Issue | `#41 [M0] Solution Architect: stack technologiczny strony i deprecacja wymagania HTML` |
| Rola decydenta | Solution Architect |
| Powiązane | ADR-0001, `docs/karta-projektu.md` §4.1, `wymagania/08`, #40 (under construction), #33 (deploy) |

---

## Kontekst

- **Wiążące wymaganie (właściciel):** strona szkolenia jest hostowana na **GitHub Pages**, domena **ai-slop.win** (już skonfigurowana, CNAME w repo).
- Dotychczasowy framing „interaktywne szkolenie **HTML**" / „musi być HTML" jest **zdeprecjonowany**: HTML/CSS/JS to *output* i konsekwencja hostingu statycznego, nie wymaganie technologiczne. Stack dobiera Solution Architect.
- ADR-0001: statyczny hosting, `localStorage`, eksport wyniku, zewnętrzny backend później, brak kroku budowania aplikacji.
- Stan Pages: tryb **legacy**, źródło = `main` root (`path: /`). Aplikacja z issue #3 leży w `genai-llm-training/`, więc serwowałaby się pod `ai-slop.win/genai-llm-training/`, **nie** pod rootem domeny — to trzeba rozwiązać.

## Decyzja (Solution Architect)

### Stack: vanilla static
**HTML + CSS + JavaScript (ES modules) + JSON** — bez frameworka, bez transpilacji, bez runtime/buildu aplikacji.

Uzasadnienie proporcjonalności:
- ~12 stron treści + wspólny shell, solo-utrzymanie, dane statyczne (JSON), brak auth, brak SEO (`noindex`), brak SSR.
- Jedyna realna korzyść frameworka tutaj (wspólny layout 12 stron) jest osiągalna prostym includem/skryptem — nie uzasadnia Node toolchaina ani abstrakcji typu content-collections.
- Zgodne z ADR-0001 („brak kroku budowania"), strukturą #3 (`assets/*.js`, `modules/m*.html`) i pełną kontrolą markupu pod WCAG 2.1 AA.
- Logika oddzielona od treści: `quiz-engine`, `test-engine`, `scoring`, `progress-store` jako moduły ES; dane jako kontrakty JSON.

**Framework (Astro/React/itp.) odrzucony** — brak konkretnej potrzeby, której vanilla nie spełnia; wprowadzałby Node toolchain i unieważniał strukturę #3/#39.

### Publikacja na root domeny (rozwiązanie problemu subdir vs root)
- **Interim (teraz):** strona „w budowie" jako root `index.html` (legacy Pages, `main` root) — issue #40. Domena żyje od razu.
- **Docelowo (budowa realnej strony, M3):** publikacja zawartości `genai-llm-training/` do **roota domeny** przez **GitHub Actions** (`build_type: workflow`): workflow pakuje katalog aplikacji (+ `CNAME`) jako artefakt Pages, serwowany pod `ai-slop.win/`. Rozwiązuje rozjazd „app w subdirze vs root" bez przenoszenia plików do roota repo. Wdrożenie workflow = issue #33.
- Alternatywy odrzucone: (a) przenieść app do roota repo — kolizja z `docs/`, `wymagania/`, `CNAME`; (b) `/docs` — wymusza nienaturalną strukturę i miesza kod z dokumentacją.

## Konsekwencje
- **Pozytywne:** minimalny stack, zero zależności runtime, pełna kontrola dostępności, zgodność z ADR-0001 i #3/#39, łatwe utrzymanie.
- **Do zrobienia (M3, #33):** workflow GitHub Actions publikujący `genai-llm-training/` (+`CNAME`) do roota i przełączenie Pages na tryb `workflow`.
- **Akceptowane:** wspólny layout realizowany prostym mechanizmem (include/mały skrypt), nie frameworkiem.

## Relacja do ADR-0001
**Refine, nie supersede.** ADR-0001 (statyczny hosting, `localStorage`, eksport, zewnętrzny backend później) pozostaje ważny. ADR-0002 dodaje: (a) potwierdza vanilla (brak frameworka), (b) definiuje mechanizm publish-to-root. Struktura repo z #3/#39 pozostaje aktualna.
