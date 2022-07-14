declare module 'pureimage' {
    import { VoidFn } from "../../src/helpers/utility_types";
    export type DrawLineType = ({ start: { x: number, y: number }, end: { x: number, y: number } }) => void;

    export interface Context {
        bitmap: Bitmap;
        textAlign: string;
        imageSmoothingEnabled: boolean;
        fillStyle: string;
        strokeStyle: string;
        lineWidth: number;
        fillRect: (x: number, y: number, w: number, h: number) => void;
        drawLine: DrawLineType;
        drawLine_aa: DrawLineType;
        strokeRect: (x: number, y: number, w: number, h: number) => void;
        fill: () => void;
        font: any;
        fillText: (text: string, x: number, y: number) => void;
        beginPath: () => void;
        arc: (x: number, y: number, rad: number, start: number, end: number, anticlockwise: boolean) => void;
        stroke: () => void;
        closePath: () => void;
        clip: () => void;
        fillPixel: (x: number, y: number) => void;
        moveTo: (x: number, y: number) => void;
        bezierCurveTo: (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) => void;
        restore: () => void;
        createRadialGradient: (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => any;
    }

    interface Font {
        binary: any,
        family: any,
        weight: any,
        style: any,
        variant: any,
        loaded: boolean,
        font: any,
        load: (cb: VoidFn) => void
    }

    export interface Bitmap {
        width: number;
        height: number;
        data: Buffer;
        getContext: (dim: '2d' | '3d') => Context;
    }

    export function make(w: number, h: number): Bitmap;

    export function registerFont(binaryPath: string, family: string, weight?: number, style?: string, variant?: string): any;

    export async function encodePNGToStream(bitmap: Bitmap, outstream: any);
}

