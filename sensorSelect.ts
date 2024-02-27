namespace microcode {
    export class SensorSelect extends CursorSceneWithPriorPage {
        private btns: Button[]
        private selectedSensors: Sensor[]
        private nextSceneEnum: CursorSceneEnum

        constructor(app: App, nextSceneEnum: CursorSceneEnum) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
            this.btns = []
            this.selectedSensors = []
            this.nextSceneEnum = nextSceneEnum
        }

        /* override */ startup() {
            super.startup()
            
            interface btnData {
                ariaID: string, 
                x: number, 
                y: number, 
                sensor: Sensor,
            }

            /**
             * Issue with consistently being able to load this app when there are > 3 buttons
             */
            const sensorBtnData: btnData[] = [
                // {ariaID: "disk1", x: -50, y: -25, fn: function () {return input.compassHeading()}},
                // {ariaID: "disk2", x: 0, y: -25, fn: function () {return input.soundLevel()}},
                // {ariaID: "disk3", x: 50, y: -25, fn: function () {return input.magneticForce(Dimension.X)}},

                {ariaID: "led_light_sensor", x: -50, y: 30, sensor: new LightSensor()}//,
                // {ariaID: "thermometer", x: 0, y: 30, sensor: new TemperatureSensor()},
                // {ariaID: "accelerometer", x: 50, y: 30, sensor: new AccelerometerSensor(Dimension.X)},

                // {ariaID: "Pin 0", x: -50, y: 25, sensor: new PinSensor(TouchPin.P0)},
                // {ariaID: "Pin 1", x: 0, y: 25, sensor: new PinSensor(TouchPin.P1)},
                // {ariaID: "Pin 2", x: 50, y: 25, sensor: new PinSensor(TouchPin.P2)},

                // {ariaID: "Pitch", x: -50, y: 50, sensor: new RotationSensor(Rotation.Pitch)},
                // {ariaID: "Roll", x: 0, y: 50, sensor: new RotationSensor(Rotation.Roll)},
                // {ariaID: "Logo Pressed", x: 50, y: 50, sensor: new LogoPressSensor()}
            ]

            const btnData = {ariaID: "led_light_sensor", x: -50, y: 30, sensor: new LightSensor()}

            // sensorBtnData.forEach(function (btnData) {
                this.btns.push(new Button({
                    parent: null,
                    style: ButtonStyles.FlatWhite,
                    icon: btnData.ariaID,
                    ariaId: btnData.ariaID,
                    x: btnData.x,
                    y: btnData.y,
                    onClick: () => {
                        this.selectedSensors.push(btnData.sensor)
                    },          
                }))
            // }) 


            // this.btns.push(new Button({
            //     parent: null,
            //     style: ButtonStyles.FlatWhite,
            //     icon: "disk1",
            //     ariaId: "Done",
            //     x: 50,
            //     y: 30,
            //     onClick: () => {
            //         if (this.selectedSensors.length === 0) {
            //             return
            //         }

            //         // const sOpts: SensorOpts = {
            //         //     sensorFn: this.selectedSensors[0].getFn(), 
            //         //     sensorName: this.selectedSensors[0].getName(),
            //         // }

            //         // const sOpts: SensorOpts = {
            //         //     sensorFn: this.selectedSensors[0].getFn(), 
            //         //     sensorName: this.selectedSensors[0].getName(),
            //         // }

            //         this.app.popScene()

            //         if (this.nextSceneEnum === CursorSceneEnum.LiveDataViewer) {
            //             this.app.pushScene(new LiveDataViewer(app, this.selectedSensors))
            //         }

            //         else {
            //             this.app.pushScene(new MeasurementConfigSelect(app, this.selectedSensors))
            //         }
            //     }
            // }))

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