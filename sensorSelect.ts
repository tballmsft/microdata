namespace microcode {
    /**
     * Responsible for allowing the user to select any number of sensors.
     *      These sensors are passed to either the measurement screen or the live data view
     * 
     * More buttons may be added to support additional sensors
     */
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

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer X",
                x: -60,
                y: -40,
                onClick: () => {
                    this.selectedSensors.push(new AccelerometerSensor(Dimension.X))
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer Y",
                x: -30,
                y: -40,
                onClick: () => {
                    this.selectedSensors.push(new AccelerometerSensor(Dimension.Y))
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer Z",
                x: 0,
                y: -40,
                onClick: () => {
                    this.selectedSensors.push(new AccelerometerSensor(Dimension.Z))
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "right_turn",
                ariaId: "Pitch",
                x: 30,
                y: -40,
                onClick: () => {
                    this.selectedSensors.push(new RotationSensor(Rotation.Pitch))
                }, 
                dynamicBoundaryColorsOn: true,          
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "right_spin",
                ariaId: "Roll",
                x: 60,
                y: -40,
                onClick: () => {
                    this.selectedSensors.push(new RotationSensor(Rotation.Roll))
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            // -----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "pin_0",
                ariaId: "Pin 0",
                x: -60,
                y: -11,
                onClick: () => {
                    this.selectedSensors.push(new PinSensor(TouchPin.P0))
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "pin_1",
                ariaId: "Pin 1",
                x: -30,
                y: -11,
                onClick: () => {
                    this.selectedSensors.push(new PinSensor(TouchPin.P1))
                },          
                dynamicBoundaryColorsOn: true,
            }))


            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "pin_2",
                ariaId: "Pin 2",
                x: 0,
                y: -11,
                onClick: () => {
                    this.selectedSensors.push(new PinSensor(TouchPin.P2))
                },          
                dynamicBoundaryColorsOn: true,
            }))


            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "led_light_sensor",
                ariaId: "led_light_sensor",
                x: 30,
                y: -11,
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
                x: 60,
                y: -11,
                onClick: () => {
                    this.selectedSensors.push(new TemperatureSensor())
                },
                dynamicBoundaryColorsOn: true,
            }))

            // -----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "magnet",
                ariaId: "S10",
                x: -60,
                y: 18,
                onClick: () => {
                    this.selectedSensors.push(new MagnetSensor(Dimension.X))
                },          
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "finger_press",
                ariaId: "Logo Press",
                x: -30,
                y: 18,
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
                x: 0,
                y: 18,
                onClick: () => {
                    this.selectedSensors.push(new VolumeSensor())
                },          
                dynamicBoundaryColorsOn: true, 
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "compass",
                ariaId: "Compass",
                x: 30,
                y: 18,
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
                x: 60,
                y: 18,
                onClick: () => {
                    this.selectedSensors.push(new ButtonPressSensor())
                },
                dynamicBoundaryColorsOn: true,     
            }))

            //-----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "green_tick",
                ariaId: "Done",
                x: 60,
                y: 44,
                onClick: () => {
                    if (this.selectedSensors.length === 0) {
                        return
                    }

                    this.app.popScene()

                    if (this.nextSceneEnum === CursorSceneEnum.LiveDataViewer) {
                        this.app.pushScene(new LiveDataViewer(app, this.selectedSensors))
                    }

                    if (this.nextSceneEnum === CursorSceneEnum.EventConfigSelect) {
                        this.app.pushScene(new EventConfigSelect(app, this.selectedSensors))
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
            
            screen.printCenter("Sensor Selection", 2)

            for (let i = 0; i < this.btns.length; ++i) {
                this.btns[i].draw()
            }

            super.draw()
        }
    }
}