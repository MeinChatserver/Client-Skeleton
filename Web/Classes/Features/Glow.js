'use strict';
/**
 * Mein Chatserver
 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
 * Licensed Materials - Property of mein-chatserver.de.
 * © Copyright 2024. All Rights Reserved.
 *
 * @version 1.0.1
 * @author  Adrian Preuß
 */

import Feature from '../Feature.js';

export default class Glow extends Feature {
    Container   = null;
    Style       = null;
    ID          = null;
    Color       = 'yellow';
    Min         = 0.3;
    Max         = 0.6;
    Speed       = 3000;
    startTime   = null;

    onInit(container, canvas, frame) {
        this.ID         = Math.random().toString(36).substr(2, 9);
        this.Container  = container;
        const Styles    = frame.getComputedStyle(this.Container);

        const rgb = Styles.color.match(/\d+/g);
        if (rgb) {
            const r = parseInt(rgb[0]);
            const g = parseInt(rgb[1]);
            const b = parseInt(rgb[2]);
            const brightness = (r + g + b) / 3;
            this.Color = `rgb(${Math.min(255, brightness * 1.3)}, ${Math.min(255, brightness * 1.2)}, ${Math.max(0, brightness * 0.2)})`;
        }
    }

    onStart() {
        this.startTime = performance.now();
    }

    onPaint() {
        const currentTime   = performance.now();
        const elapsed                   = currentTime - this.startTime;
        const progress                  = (elapsed % this.Speed) / this.Speed;
        const wave                      = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
        const size                      = this.Min + (this.Max - this.Min) * wave;
        this.Container.style.textShadow         = `0 0 ${size}em ${this.Color}, 0 0 ${size}em ${this.Color}, 0 0 ${size}em ${this.Color}, 0 0 ${size}em ${this.Color}`;
    }

    onDestroy() {
        this.Container.style.textShadow = '';
    }
}