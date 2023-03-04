import Decimal from 'decimal.js'
import makerjs from 'makerjs'
import {CutoutGenerator} from './CutoutGenerator'

// Basic MX switch cutout
// Simple filleted square of 14mm size

export class SwitchMXBasic extends CutoutGenerator {

    getOutline(width, height, generatorOptions) {
        const plusHalfWidth = width.dividedBy(new Decimal("2"))
        const minsHalfWidth = width.dividedBy(new Decimal("-2"))
        const plusHalfHeight = height.dividedBy(new Decimal("2"))
        const minsHalfHeight = height.dividedBy(new Decimal("-2"))

        return {
            upperLeft: [minsHalfWidth.plus(generatorOptions.kerf).toNumber(), plusHalfHeight.minus(generatorOptions.kerf).toNumber()],
            upperRight: [plusHalfWidth.minus(generatorOptions.kerf).toNumber(), plusHalfHeight.minus(generatorOptions.kerf).toNumber()],
            lowerLeft: [minsHalfWidth.plus(generatorOptions.kerf).toNumber(), minsHalfHeight.plus(generatorOptions.kerf).toNumber()],
            lowerRight: [plusHalfWidth.minus(generatorOptions.kerf).toNumber(), minsHalfHeight.plus(generatorOptions.kerf).toNumber()]
        }
    }

    createLine(origin, end, layer) {
        let line = new makerjs.paths.Line(origin, end)
        line.layer = layer
        return line
    }

    generate(key, generatorOptions) {

        const cutoutOutline = this.getOutline(new Decimal("14"), new Decimal("14"), generatorOptions)
        const keyOutline = this.getOutline(new Decimal(19.05 * key.width), new Decimal(19.05 * key.height), generatorOptions)
        const keycapOutline = this.getOutline(new Decimal(19.05 * key.width - (19.05 - 18.1)), new Decimal(19.05 * key.height - (19.05 - 18.1)), generatorOptions)

        let cutoutName = "KeyCutout";
        let keyOutlineName = "KeyOutline";
        let keycapOutlineName = "KeycapOutline";

        let model = {
            paths: {
                lineTop: this.createLine(cutoutOutline.upperLeft, cutoutOutline.upperRight, cutoutName),
                lineBottom: this.createLine(cutoutOutline.lowerLeft, cutoutOutline.lowerRight, cutoutName),
                lineLeft: this.createLine(cutoutOutline.upperLeft, cutoutOutline.lowerLeft, cutoutName),
                lineRight: this.createLine(cutoutOutline.upperRight, cutoutOutline.lowerRight, cutoutName),

                keyLineTop: this.createLine(keyOutline.upperLeft, keyOutline.upperRight, keyOutlineName),
                keyLineBottom: this.createLine(keyOutline.lowerLeft, keyOutline.lowerRight, keyOutlineName),
                keyLineLeft: this.createLine(keyOutline.upperLeft, keyOutline.lowerLeft, keyOutlineName),
                keyLineRight: this.createLine(keyOutline.upperRight, keyOutline.lowerRight, keyOutlineName),

                keycapLineTop: this.createLine(keycapOutline.upperLeft, keycapOutline.upperRight, keycapOutlineName),
                keycapLineBottom: this.createLine(keycapOutline.lowerLeft, keycapOutline.lowerRight, keycapOutlineName),
                keycapLineLeft: this.createLine(keycapOutline.upperLeft, keycapOutline.lowerLeft, keycapOutlineName),
                keycapLineRight: this.createLine(keycapOutline.upperRight, keycapOutline.lowerRight, keycapOutlineName),
            }
        };

        if (generatorOptions.switchFilletRadius.gt(0)) {

            const filletNum = generatorOptions.switchFilletRadius.toNumber()

            var filletTopLeft = makerjs.path.fillet(model.paths.lineTop, model.paths.lineLeft, filletNum)
            var filletTopRight = makerjs.path.fillet(model.paths.lineTop, model.paths.lineRight, filletNum)
            var filletBottomLeft = makerjs.path.fillet(model.paths.lineBottom, model.paths.lineLeft, filletNum)
            var filletBottomRight = makerjs.path.fillet(model.paths.lineBottom, model.paths.lineRight, filletNum)

            model.paths.filletTopLeft = filletTopLeft;
            model.paths.filletTopRight = filletTopRight;
            model.paths.filletBottomLeft = filletBottomLeft;
            model.paths.filletBottomRight = filletBottomRight;

        }

        if (!key.skipOrientationFix && key.height > key.width) {
            model = makerjs.model.rotate(model, -90)
        }

        return model;
    }
}