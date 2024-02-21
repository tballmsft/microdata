namespace microcode {
    export class SensorSelect extends CursorSceneWithPriorPage {
        private btns: Button[]
        private nextSceneEnum: CursorSceneEnum

        constructor(app: App, nextSceneEnum: CursorSceneEnum) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
            this.btns = []
            this.nextSceneEnum = nextSceneEnum
        }

        /* override */ startup() {
            super.startup()
            
            interface btnData {
                ariaID: string, 
                x: number, 
                y: number, 
                name: string, 
                fn: () => number
            }

            /**
             * Generalisation for touch pin events
             * Necessary since the inner function of input.onPinPressed(pin fn(){}) is () => void; where () => number is required
             * @param pin TouchPin.P0, TouchPin.P1, TouchPin.P2
             * @returns 
             */
            const pinPressFunction = function(pin: TouchPin): number {
                let res: number = 0
                input.onPinPressed(TouchPin.P0, function () {
                    res = 1
                })
                return res
            }


            /**
             * Issue with consistently being able to load this app when there are > 3 buttons
             */
            const sensorBtnData: {[id: string]: btnData;} = {
                // "disk1": {ariaID: "disk1", x: -50, y: -25, name: "disk1", fn: function () {return input.compassHeading()}},
                // "disk2": {ariaID: "disk2", x: 0, y: -25, name: "disk2", fn: function () {return input.soundLevel()}},
                // "disk3": {ariaID: "disk3", x: 50, y: -25, name: "disk3", fn: function () {return input.magneticForce(Dimension.X)}},

                "led_light_sensor": {ariaID: "led_light_sensor", x: -50, y: 30, name: "Light Level", fn: function () {return input.lightLevel()}},
                "thermometer": {ariaID: "thermometer", x: 0, y: 30, name: "Temperature", fn: function () {return input.temperature()}},
                "accelerometer": {ariaID: "accelerometer", x: 50, y: 30, name: "Accelerometer", fn: function () {return input.acceleration(Dimension.X)}}

                // "a": {ariaID: "a", x: -50, y: 25, name: "Light\nLevel", fn: function() {return pinPressFunction(TouchPin.P0)}},
                // "b": {ariaID: "b", x: 0, y: 25, name: "Temperature", fn: function () {return pinPressFunction(TouchPin.P1)}},
                // "c": {ariaID: "c", x: 50, y: 25, name: "Accelerometer", fn: function () {return pinPressFunction(TouchPin.P2)}},

                // "moveTiltUp": {ariaID: "d", x: -50, y: 50, name: "Pitch", fn: function () {return input.rotation(Rotation.Pitch)}},
                // "moveTiltLeft": {ariaID: "e", x: 0, y: 50, name: "Roll", fn: function () {return Rotation.Roll}},
                // "finger_press": {ariaID: "f", x: 50, y: 50, name: "Pin Press", fn: function () {if(input.logoIsPressed()) {return 255} return 0}}
            }


            Object.keys(sensorBtnData).forEach(
                key => {
                    this.btns.push(new Button({
                        parent: null,
                        style: ButtonStyles.FlatWhite,
                        icon: key,
                        ariaId: sensorBtnData[key].ariaID,
                        x: sensorBtnData[key].x,
                        y: sensorBtnData[key].y,
                        onClick: () => {
                            const sOpts: SensorOpts = {
                                sensorFn: sensorBtnData[key].fn, 
                                sensorName: sensorBtnData[key].name,
                            }

                            this.app.popScene()
                            // if (this.nextSceneEnum === CursorSceneEnum.LiveDataViewer) {
                            //     this.app.pushScene(new LiveDataViewer(app, sOpts))
                            // }
                            // else {
                                this.app.pushScene(new MeasurementConfigSelect(app, sOpts))
                            // }
                        },          
                    }))
                }
            )

            this.navigator.addButtons(this.btns)
        }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xc
            )
            
            screen.printCenter("Select a sensor to log", 5)

            this.btns.forEach((btn) => {
                btn.draw()
            })
            super.draw()
        }
    }
}