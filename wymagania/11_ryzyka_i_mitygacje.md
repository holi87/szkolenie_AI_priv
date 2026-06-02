# Analiza biznesowa szkolenia GenAI i LLM dla QualityCat

## 11. **Ryzyka i mitygacje**

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|---|---:|---:|---|
| Szkolenie stanie się zbyt techniczne dla S1 | Średnie | Średni | Oddzielić wersję świadomościową i pełną; w S1 używać decyzji biznesowych zamiast szczegółów implementacyjnych |
| Szkolenie będzie zbyt ogólne dla S3 | Średnie | Wysoki | Dodać moduły M4–M6 i M12 jako obowiązkowe, z case studies RAG/evaluation |
| Pytania będą sprawdzać definicje zamiast decyzji | Średnie | Wysoki | Minimum 35% pytań scenariuszowych i zadania praktyczne dla S2/S3 |
| Uczestnicy nauczą się odpowiedzi na pamięć | Średnie | Średni | Rotacja wariantów, anti-gaming, większy bank pytań niż test końcowy |
| Pytania krytyczne będą dwuznaczne | Niskie/średnie | Wysoki | Recenzja security + pilotaż; pytania krytyczne z jasnym uzasadnieniem |
| Brak polityki danych QualityCat przed budową | Średnie | Wysoki | Oznaczyć M10 jako wymagający zatwierdzenia; użyć domyślnej konserwatywnej polityki do czasu decyzji |
| Zmiany w standardach OWASP lub narzędziach GenAI | Wysokie | Średni | Przegląd treści co 6 miesięcy; oddzielić pojęcia trwałe od przykładów narzędzi |
| Brak backendu utrudni raportowanie | Średnie | Średni | Wybrać wariant C dla rollout lub wariant B z eksportem wyników dla pilotażu |
| Interakcje HTML będą niedostępne dla użytkowników klawiatury | Średnie | Wysoki | Wymagać alternatywy dla drag & drop i testów WCAG |
| Uczestnicy zaufają outputowi LLM po szkoleniu bardziej niż przed | Niskie/średnie | Wysoki | W każdym module wzmacniać zasadę: output wymaga kontroli; M11 obowiązkowy dla wszystkich |
| Przykłady danych przypadkowo będą realistycznie wrażliwe | Niskie | Wysoki | Używać wyłącznie danych syntetycznych i recenzji security |
| Za mała grupa pilotażowa nie skalibruje trudności | Średnie | Średni | Zebrać minimum 8–15 osób lub wykonać drugi pilotaż po pierwszym rolloucie |
| Nadmierna liczba modułów obniży completion rate | Średnie | Średni | Ścieżki modułowe, progres, krótkie sekcje, jasne rozróżnienie obowiązkowe/opcjonalne |
