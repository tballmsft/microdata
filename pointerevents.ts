namespace pointerevents {
    export interface PointerEventMessage {
        type: "pointerdown" | "pointerup" | "pointermove"
        x: number
        y: number
        buttons: number
    }

    export interface WheelEventMessage {
        type: "wheel"
        dx: number 
        dy: number
        dz: number
    }
}
