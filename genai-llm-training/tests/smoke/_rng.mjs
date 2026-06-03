// _rng.mjs — wspólne, deterministyczne RNG dla testów (issue #70, QA-2). NIE jest plikiem testowym.
// seededRng (mulberry32) NIE jest tu duplikowane — re-eksportujemy je z _fixtures.mjs (jedno źródło prawdy).
// constantRng/sequenceRng dają ZNANE wyjście, żeby asercjonować „opcja X ląduje na pozycji Y" bez zgadywania.
// Konsumenci: RND-1 (quiz-view-shuffle — dokładna, powtarzalna permutacja), UX-2..UX-6 (testy strukturalne).
import { seededRng } from "./_fixtures.mjs";

export { seededRng };

/** RNG stały: zawsze zwraca v (domyślnie 0). Z Fisher-Yates daje w pełni przewidywalną permutację. */
export function constantRng(v = 0) {
  return () => v;
}

/** RNG cykliczny: oddaje wartości z arr po kolei, po wyczerpaniu zaczyna od początku. */
export function sequenceRng(arr) {
  if (!Array.isArray(arr) || arr.length === 0) throw new Error("sequenceRng: wymagana niepusta tablica");
  let i = 0;
  return () => {
    const v = arr[i % arr.length];
    i += 1;
    return v;
  };
}
