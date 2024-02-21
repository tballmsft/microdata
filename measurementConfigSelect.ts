namespace microcode {
    // interface IDictionary {
    //     [index: string]: number;
    // }
    // const MAXIMUMS = {measurements: 1000, period: 10000} as IDictionary;

    export class MeasurementConfigSelect extends CursorSceneWithPriorPage {
        // Passed to DataRecorder:
        // private sOpts: SensorOpts
        // private measurementOpts: IDictionary
        // private mode: string = "measurements"
        // private btns: Button[]
        
        // constructor(app: App, sOpts: SensorOpts) {
        //     super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})

        //     this.sOpts = sOpts;

        //     // Defaults:
        //     this.measurementOpts = {
        //         measurements: 20, 
        //         period: 1000
        //     }
        // }

            private dataBuffer: number[] = [];
            private sensorFn: () => number
            private sensorName: string
    
            constructor(app: App, userOpts: SensorOpts) {
                super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
                this.color = 0
                this.sensorFn = userOpts.sensorFn
                this.sensorName = userOpts.sensorName
    
                const goBack = function() {
                    app.popScene()
                    app.pushScene(new Home(app))
                };
    
                control.onEvent(
                    ControllerButtonEvent.Pressed,
                    controller.B.id,
                    () => goBack()
                )
            }

        // /* override */ startup() {
        //     super.startup()
        // }

        //     interface btnData {
        //         ariaID: string, 
        //         x: number, 
        //         y: number, 
        //         name: string, 
        //         fn: () => number
        //     }

        //     const sensorBtnData: {[id: string]: btnData;} = {
        //         "led_light_sensor": {ariaID: "led_light_sensor", x: -50, y: 50, name: "Light Level", fn: function () {return input.lightLevel()}},
        //         "thermometer": {ariaID: "thermometer", x: 0, y: 50, name: "Temperature", fn: function () {return input.temperature()}},
        //         "accelerometer": {ariaID: "accelerometer", x: 50, y: 50, name: "Accelerometer", fn: function () {return input.acceleration(Dimension.X)}}
        //     }

        //     Object.keys(sensorBtnData).forEach(
        //         key => {
        //             this.btns.push(new Button({
        //                 parent: null,
        //                 style: ButtonStyles.FlatWhite,
        //                 icon: key,
        //                 ariaId: sensorBtnData[key].ariaID,
        //                 x: sensorBtnData[key].x,
        //                 y: sensorBtnData[key].y,
        //                 onClick: () => {
        //                     this.app.popScene()
        //                     this.app.pushScene(new DataRecorder(this.app, {
        //                         sensorFn: sensorBtnData[key].fn, 
        //                         sensorName: sensorBtnData[key].name, 
        //                         measurements: this.measurementOpts.measurements, 
        //                         period: this.measurementOpts.period
        //                     }))
        //                 },          
        //             }))
        //         }
        //     )
        // }

        // /* override */ activate() {
        //     super.activate()
        //     this.color = 15
        // }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )
            
            // if (this.mode === "period") {
            //     screen.printCenter("Measurement period", 20)
            // }

            // else if (this.mode === "measurements") {
            //     screen.printCenter("Number of measurements", 20)
            // }

            // let value = "" + this.measurementOpts[this.mode];
            // const textOffset = (screen.width - (font.charWidth * value.length)) / 2

            // Screen.print(
            //     value,
            //     Screen.LEFT_EDGE + textOffset,
            //     Screen.TOP_EDGE + (screen.height / 2),
            //     0xb,
            //     simage.font8
            // )
            
            super.draw()
        }
    }
}