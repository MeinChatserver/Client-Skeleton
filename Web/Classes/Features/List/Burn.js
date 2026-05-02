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

import Feature from '../../Feature.js';

export default class Burn extends Feature {
    Container       = null;
    Frame           = null;
    Running         = false;

    _width			= -1;
    _height			= -1;
    _line_height	= -1;
    _highQuality	= false;
    _scale			= -1;
    _width_new		= -1;
    _height_new		= -1;
    _canvas			= null;
    _context		= null;
    _image			= null;
    _milliseconds	= -1;
    _fireIntensity	= 1;
    _lastMoveTime	= 0;
    _firePixels		= [];
    _shift			= -1;
    _i				= [4, 12, 20, 30];
    _colorsWarm		= [];
    _colorsCold		= [];
    _lightness		= [];
    _morphTargets	= [];

    // @ToDo überarbeiten, da uralter code. Geht performanter und besser als über backgroundImage & temporären Canvas.
    onInit(container, canvas, frame) {
        this.ID         = Math.random().toString(36).substr(2, 9);
        this.Container  = container;
        this.Frame      = frame;

        this._width			= 200;
        this._height			= 100;
        this._line_height	= 2;
        this._scale			= 100;
        this._width_new		= Math.ceil(this._width / this._line_height);
        this._height_new		= Math.ceil((this._height * this._scale) / (this._line_height * 100));
        this._canvas			= document.createElement('canvas');
        this._canvas.width	= this._width_new;
        this._canvas.height	= this._height_new;
        this._context		= this._canvas.getContext('2d');
        this._image			= this._context.createImageData(this._width, this._height);
        this._milliseconds	= Date.now();
        this._firePixels		= new Array(100).fill(0);
        this._lightness		= new Array(this._height_new * this._width_new).fill(0);
        this._morphTargets	= new Array(this._height * this._width).fill(0);
        this._fireIntensity	= this._highQuality ? 2 : 1;

        this.changeStyle();
        this.initializeColors();
    }

    onStart() {
        this.Running = true;
        this.repaint();
    }

    onDestroy() {
        this.Running = false;
        this.Container.style.backgroundImage = '';
        this.Container.style.textShadow = '';
    }

    repaint() {
        if(!this.Running) {
            return;
        }

        this.move();
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this.paint(0, 0, this._canvas.width);
        this.Frame.requestAnimationFrame(this.repaint.bind(this));
        this.Container.style.backgroundImage = 'url(' + this._canvas.toDataURL("image/png") + ')';
    }

    changeStyle() {
        this.Container.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
    }

    fillWithColor(pixels, min, max, redStart, redEnd, greenStart, greenEnd, blueStart, blueEnd, alphaStart, alphaEnd) {
        const segmentLength = max - min;

        for(let index = 0; index < segmentLength; index++) {
            pixels[min + index] = this.createColor((redStart * (segmentLength - index) + blueStart * index) / segmentLength, (redEnd * (segmentLength - index) + blueEnd * index) / segmentLength, (greenStart * (segmentLength - index) + alphaStart * index) / segmentLength, (greenEnd * (segmentLength - index) + alphaEnd * index) / segmentLength);
        }
    }

    createColor(red, green, blue, alpha) {
        red		= Math.max(0, Math.min(255, red));
        green	= Math.max(0, Math.min(255, green));
        blue	= Math.max(0, Math.min(255, blue));

        return (alpha << 24) | (green << 16) | (green << 8) | blue;
    }

    initializeColors() {
        const alpha_available = true; // because browsers has it!

        this.fillWithColor(this._colorsCold, 0, 5, 0, 0, 0, alpha_available ? 0 : 255, 0, 0, 0, alpha_available ? 212 : 255);
        this.fillWithColor(this._colorsWarm, 0, 32, 0, 0, 0, 255, 0, 0, 255, 255);
        this.fillWithColor(this._colorsWarm, 32, 96, 0, 0, 255, 255, 255, 0, 0, 255);
        this.fillWithColor(this._colorsWarm, 96, 160, 255, 0, 0, 255, 255, 255, 0, 255);
        this.fillWithColor(this._colorsWarm, 160, 256, 255, 255, 0, 255, 255, 255, 255, 255);
        this.fillWithColor(this._colorsWarm, 256, 1225, 255, 255, 255, 255, 255, 255, 255, 255);
    }

    spreadToBottom(pixels, start, end, value) {
        for(let i = start; i < end; i++) {
            pixels[i] = value;
        }

        return pixels;
    }

    addRandomSparks() {
        this._shift += this._width;

        while(this._shift > 160) {
            this._shift		-= 160;
            const x		= Math.floor(Math.random() * this._width);
            const y		= Math.floor(Math.random() * 24);

            this.ignite(x - 7, this._height - 4 - y);
        }
    }

    ignite(x, y) {
        for(let i = 0; i < 7; i++) {
            for(let j = 0; j < 4; j++) {
                this._morphTargets[(y + j) * this._width + i + x] = 1224;
            }
        }
    }

    coolFire() {
        const endIndex = this._morphTargets.length - this._width - 1;

        for(let i = 0; i < endIndex; i++) {
            let newVal			= (this._morphTargets[i] + this._morphTargets[i + this._width] + this._morphTargets[i + this._height - 1] + this._morphTargets[i + this._width + 1] + 2) >> 2;
            newVal				-= 3;
            this._morphTargets[i]	= Math.max(0, newVal);
        }
    }

    moves(distance) {
        const timeCurrent = Date.now();

        if(timeCurrent < this._lastMoveTime) {
            this._lastMoveTime = timeCurrent;
        }

        if(timeCurrent - this._lastMoveTime > 14) {
            let elapsedMillis	= ((timeCurrent * distance) / 1000 - (this._lastMoveTime * distance) / 1000) | 0;
            this._lastMoveTime		= timeCurrent;

            if(elapsedMillis > 20) {
                elapsedMillis = 20;
            }

            while(elapsedMillis > 0) {
                this.move();
                elapsedMillis--;
            }
        }
    }

    move() {
        this._morphTargets = this.spreadToBottom(this._morphTargets, this._width * (this._height - 1), this._width * this._height, 280);

        this.addRandomSparks();
        this.coolFire();
    }

    updateDisplayPixels() {
        let index				= 0;
        const canvasRowLength	= this._width * this._line_height;

        for(let y = 0; y < this._height_new; y++) {
            const baseIndex = y * canvasRowLength;

            for(let x = 0; x < this._width_new; x++) {
                let color;
                const pixelIndex	= baseIndex + x * this._line_height;
                const intensity		= this._morphTargets[pixelIndex];

                if(intensity > 0) {
                    color = this._colorsWarm[intensity];
                } else {
                    let maxShift = 0;

                    for(let targetIndex = 1; targetIndex <= 5; targetIndex++) {
                        const shiftedIndex = pixelIndex + canvasRowLength * targetIndex;

                        if(shiftedIndex < this._morphTargets.length) {
                            const morphTarget	= this._morphTargets[shiftedIndex];
                            let shiftAmount		= 0;

                            for(let j = this._i.length - 1; j >= 0; j--) {
                                if(morphTarget >= this._i[j]) {
                                    shiftAmount = j + 1;
                                    break;
                                }
                            }

                            const j = shiftAmount - targetIndex + 1;

                            if(j > maxShift) {
                                maxShift = j;
                            }
                        }
                    }

                    const targetIndex	= (index + maxShift + 1) >> 2;
                    index				= maxShift;
                    color				= this._colorsCold[targetIndex];
                }

                this._lightness[y * this._width_new + x] = color;
            }
        }

        const imageData = this._image.data;

        for(let i = 0; i < this._lightness.length; i++) {
            const color		= this._lightness[i];
            const offset	= i * 4;

            imageData[offset]		= (color >> 16) & 0xFF;	// R
            imageData[offset + 1]	= (color >> 8) & 0xFF;	// G
            imageData[offset + 2]	= (color & 0xFF);		// B
            imageData[offset + 3]	= (color >> 24) & 0xFF;	// A
        }

        this._context.putImageData(this._image, 0, 0);
    }

    paint(x, y, frames) {
        this.updateDisplayPixels();

        let offset = 0;
        while(offset < frames) {
            this._context.drawImage(this._canvas, x + offset, y);
            offset += this._width_new;
        }
    }
}