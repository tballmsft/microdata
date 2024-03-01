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

            // Issues with Crashing when too many buttons are visible persist:

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer",
                x: -60,
                y: -34,
                onClick: () => {
                    this.selectedSensors.push(new AccelerometerSensor(Dimension.X))
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "pin_0",
                ariaId: "Pin 0",
                x: -30,
                y: -34,
                onClick: () => {
                    this.selectedSensors.push(new PinSensor(TouchPin.P0))
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "magnet",
                ariaId: "S10",
                x: 0,
                y: -34,
                onClick: () => {
                    this.selectedSensors.push(new MagnetSensor(Dimension.X))
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer",
                x: 30,
                y: -34,
                onClick: () => {
                    this.selectedSensors.push(new AccelerometerSensor(Dimension.X))
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "right_turn",
                ariaId: "Pitch",
                x: 60,
                y: -34,
                onClick: () => {
                    this.selectedSensors.push(new RotationSensor(Rotation.Pitch))
                }, 
                dynamicBoundaryColorsOn: true,          
            }))

            // -----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "right_spin",
                ariaId: "Roll",
                x: -60,
                y: -4,
                onClick: () => {
                    this.selectedSensors.push(new RotationSensor(Rotation.Roll))
                },          
                dynamicBoundaryColorsOn: true, 
            }))


            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "led_light_sensor",
                ariaId: "led_light_sensor",
                x: -30,
                y: -4,
                onClick: () => {
                    this.selectedSensors.push(new LightSensor())
                },
                dynamicBoundaryColorsOn: true,  
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "thermometer",
                ariaId: "thermometer",
                x: 0,
                y: -4,
                onClick: () => {
                    this.selectedSensors.push(new TemperatureSensor())
                },
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "finger_press",
                ariaId: "Logo Press",
                x: 30,
                y: -4,
                onClick: () => {
                    this.selectedSensors.push(new LogoPressSensor())
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "speaker",
                ariaId: "Volume",
                x: 60,
                y: -4,
                onClick: () => {
                    this.selectedSensors.push(new VolumeSensor())
                },          
                dynamicBoundaryColorsOn: true, 
            }))


            //-----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "right_spin",
                ariaId: "Compass",
                x: -60,
                y: 26,
                onClick: () => {
                    this.selectedSensors.push(new CompassHeadingSensor())
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "tile_button_a",  
                ariaId: "F3",
                x: -30,
                y: 26,
                onClick: () => {
                    this.selectedSensors.push(new ButtonPressSensor())
                },      
                dynamicBoundaryColorsOn: true,     
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "green_tick",
                ariaId: "Done",
                x: 60,
                y: 40,
                onClick: () => {
                    if (this.selectedSensors.length === 0) {
                        return
                    }

                    this.app.popScene()

                    if (this.nextSceneEnum === CursorSceneEnum.LiveDataViewer) {
                        this.app.pushScene(new LiveDataViewer(app, this.selectedSensors))
                    }

                    else {
                        this.app.pushScene(new MeasurementConfigSelect(app, this.selectedSensors))
                    }
                }
            }))

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
            
            screen.printCenter("Select Sensors to log", 5)

            // Following 3 lines may be tabbed - results in same error regardless:

            // this.btns.forEach((btn) => {
            //     btn.draw()
            // })

            for (let i = 0; i < this.btns.length; ++i) {
                this.btns[i].draw()
            }

            // Identical:

            // this.btns[0].draw()
            // this.btns[1].draw()
            // this.btns[2].draw()
            // this.btns[3].draw()
            // this.btns[4].draw()
            // this.btns[5].draw()

            super.draw()
        }
    }
}