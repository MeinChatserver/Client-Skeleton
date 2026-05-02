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

export default class Snow extends Feature {
    Flakes  = [];
    Count   = 100;
    Running = false;

    onInit(container, canvas, frame) {
        for (let i = 0; i < this.Count; i++) {
            this.Flakes.push({
                x:          Math.random() * canvas.clientWidth,
                y:          Math.random() * canvas.clientHeight,
                radius:     (Math.random() * 3 + 1) * 0.75,
                speed:      Math.random() + 0.5,
                drift:      Math.random() * 0.5 - 0.25,
                opacity:    Math.random() * 0.5 + 0.5
            });
        }
    }

    onStart() {
        this.Running = true;
    }

    onDestroy() {
        this.Running    = false;
        this.Flakes     = [];
    }

    onPaint(context, canvas) {
        if(!this.Running) {
            return;
        }

        const width     = canvas.clientWidth;
        const height    = canvas.clientHeight;

        this.Flakes.forEach(flake => {
            context.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            context.fillRect(flake.x, flake.y, flake.radius * 2, flake.radius * 2);

            flake.y += flake.speed;
            flake.x += flake.drift;

            if(flake.y > height) {
                flake.y = -10;
                flake.x = Math.random() * width;
            }

            if(flake.x > width) {
                flake.x = 0;
            }

            if(flake.x < 0) {
                flake.x = width;
            }
        });
    }
}