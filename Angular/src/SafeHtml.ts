/**
 * Letzte Verteidigungslinie fuer admin-geschriebenes HTML im Chat-Fenster.
 *
 * Der Inhalt eines Content-Elements wird bereits beim Speichern gefiltert
 * (API/services/window-content.js). Diese Funktion ist die zweite Linie, und
 * sie ist noetig, weil zwischen "gespeichert" und "hier gerendert" eine lange
 * Kette liegt: Bestandsdaten stammen aus der Zeit vor dem Filter, das
 * Altsystem schreibt weiter in dieselbe Tabelle, und wer Datenbankzugriff hat,
 * umgeht die API ohnehin.
 *
 * Bewusst kein zweiter Allowlist-Parser: Der wuerde vom serverseitigen
 * auseinanderlaufen, und ein Client-Bundle soll dafuer keine Bibliothek
 * mitschleppen. Stattdessen wird der Baum nach dem Parsen durchgegangen und
 * genau das entfernt, was Code ausfuehren kann - der Rest der Formatierung
 * bleibt unangetastet.
 */

const FORBIDDEN_TAGS = new Set([
  'SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE', 'FORM', 'APPLET',
]);

const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href', 'action', 'formaction']);
const SAFE_SCHEMES = /^(?:https?:|mailto:|\/|#|\.\/|\.\.\/)/i;

/**
 * Setzt HTML in ein Element, nachdem aktive Inhalte entfernt wurden.
 *
 * Geparst wird ueber ein <template>: dessen Inhalt landet in einem inerten
 * Dokumentfragment, in dem Bilder nicht geladen und Skripte nicht ausgefuehrt
 * werden. Ein zwischenzeitliches innerHTML am echten Dokument haette genau das
 * ausgeloest, was wir verhindern wollen.
 */
export function setSafeHtml(target: HTMLElement, html: string | null | undefined): void {
  const doc = target.ownerDocument ?? document;
  const template = doc.createElement('template');

  template.innerHTML = String(html ?? '');
  cleanFragment(template.content);

  target.replaceChildren(...Array.from(template.content.childNodes));
}

function cleanFragment(root: DocumentFragment | HTMLElement): void {
  const elements = Array.from(root.querySelectorAll('*'));

  for (const element of elements) {
    if (FORBIDDEN_TAGS.has(element.tagName)) {
      element.remove();
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();

      // on* deckt jeden Ereignis-Handler ab, ohne sie einzeln aufzuzaehlen.
      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if (URL_ATTRIBUTES.has(name) && !SAFE_SCHEMES.test(attribute.value.trim())) {
        element.removeAttribute(attribute.name);
        continue;
      }

      // url() in style laedt externe Adressen nach und verraet damit die IP
      // jedes Besuchers; expression() fuehrt in alten Engines Code aus.
      if (name === 'style' && /\b(?:url|expression)\s*\(/i.test(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
    }

    // Ein Link mit target="_blank" gibt der Zielseite ueber window.opener
    // Zugriff auf das Chat-Fenster.
    if (element.tagName === 'A' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }
}
