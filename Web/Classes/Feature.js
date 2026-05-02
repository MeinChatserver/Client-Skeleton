export default class Feature {
    onInit(container, canvas, frame) {
        /* When the Feature is initialized */
    }

    onDestroy() {
        /* When the Feature was destroyed */
    }

    onStart() {
        /* When the Feature was started */
    }

    onPaint(context) {
        /* When the Feature will be rendered */
    }
}

customElements.define('feature-canvas', Feature, { extends: 'canvas' });