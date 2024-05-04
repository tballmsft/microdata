namespace microcode {
    const SENSOR_LOOKUP_TABLE: {[ariaID: string]: Sensor} = {
        "accelerometer X": new AccelerometerSensor(Dimension.X),
        "accelerometer Y": new AccelerometerSensor(Dimension.Y),
        "accelerometer Z": new AccelerometerSensor(Dimension.Z),
        "Pitch": new RotationSensor(Rotation.Pitch),
        "Roll": new RotationSensor(Rotation.Roll),
        "Pin 0": new PinSensor(TouchPin.P0),
        "Pin 1": new PinSensor(TouchPin.P1),
        "Pin 2": new PinSensor(TouchPin.P2),
        "led_light_sensor": new LightSensor(),
        "thermometer": new TemperatureSensor(),
        "S10": new MagnetSensor(Dimension.X),
        "Logo Press": new LogoPressSensor(),
        "Volume": new VolumeSensor(),
        "Compass": new CompassHeadingSensor(),
        "F3": new ButtonAPressSensor(),
        "F4": new ButtonBPressSensor(),
        "JacdacLight": new JacdacLightSensor(),
        "JacdacSoilMoisture": new JacdacSoilMoistureSensor(),
        "JacdacDistance": new JacdacDistanceSensor()
    }

    /**
     * Responsible for allowing the user to select any number of sensors.
     *      These sensors are passed to either the measurement screen or the live data view
     * 
     * More buttons may be added to support additional sensors
     */
    export class SensorSelect extends CursorSceneWithPriorPage {
        private btns: Button[]
        private selectedSensorNames: string[]
        private nextSceneEnum: CursorSceneEnum
        
        constructor(app: App, nextSceneEnum: CursorSceneEnum) {
            super(app, function () {app.popScene(); app.pushScene(new Home(this.app))})
            this.btns = []
            this.selectedSensorNames = []
            this.nextSceneEnum = nextSceneEnum
        }

        /* override */ startup() {
            super.startup()

            //---------
            // Control:
            //---------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "accelerometer",
                ariaId: "accelerometer X",
                x: -60,
                y: -40,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("accelerometer X")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("accelerometer X")
                    }
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
                    const index = this.selectedSensorNames.indexOf("accelerometer Y")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("accelerometer Y")
                    }
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
                    const index = this.selectedSensorNames.indexOf("accelerometer Z")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("accelerometer Z")
                    }
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
                    const index = this.selectedSensorNames.indexOf("Pitch")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Pitch")
                    }
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
                    const index = this.selectedSensorNames.indexOf("Roll")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Roll")
                    }
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
                    const index = this.selectedSensorNames.indexOf("Pin 0")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Pin 0")
                    }
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
                    const index = this.selectedSensorNames.indexOf("Pin 1")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Pin 1")
                    }
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
                    const index = this.selectedSensorNames.indexOf("Pin 2")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Pin 2")
                    }
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
                    const index = this.selectedSensorNames.indexOf("led_light_sensor")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("led_light_sensor")
                    }
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
                    const index = this.selectedSensorNames.indexOf("thermometer")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("thermometer")
                    }
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
                    const index = this.selectedSensorNames.indexOf("S10")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("S10")
                    }
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
                    const index = this.selectedSensorNames.indexOf("Logo Press")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Logo Press")
                    }
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
                    const index = this.selectedSensorNames.indexOf("Volume")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Volume")
                    }
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
                    const index = this.selectedSensorNames.indexOf("Compass")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("Compass")
                    }
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
                    const index = this.selectedSensorNames.indexOf("F3")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("F3")
                    }
                },
                dynamicBoundaryColorsOn: true,     
            }))

            //-----------

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "tile_button_b",
                ariaId: "F4",
                x: -60,
                y: 44,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("F4")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("F4")
                    }
                },
                dynamicBoundaryColorsOn: true,     
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "microbitLogoWhiteBackground",
                ariaId: "Jacdac Light",
                x: -30,
                y: 44,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("JacdacLight")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("JacdacLight")
                    }
                },
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "microbitLogoWhiteBackground",
                ariaId: "Jacdac Moisture",
                x: 0,
                y: 44,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("JacdacSoilMoisture")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("JacdacSoilMoisture")
                    }
                },
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "microbitLogoWhiteBackground",
                ariaId: "Jacdac Distance",
                x: 30,
                y: 44,
                onClick: () => {
                    const index = this.selectedSensorNames.indexOf("JacdacDistance")
                    if (index != -1) {
                        this.selectedSensorNames.splice(index, 1)
                    }
                    else {
                        this.selectedSensorNames.push("JacdacDistance")
                    }
                },
                dynamicBoundaryColorsOn: true,
            }))

            this.btns.push(new Button({
                parent: null,
                style: ButtonStyles.Transparent,
                icon: "green_tick",
                ariaId: "Done",
                x: 60,
                y: 44,
                onClick: () => {
                    if (this.selectedSensorNames.length === 0) {
                        return
                    }
                    const sensors = this.selectedSensorNames.map((name) => SENSOR_LOOKUP_TABLE[name])
                    this.app.popScene()
                    if (this.nextSceneEnum === CursorSceneEnum.LiveDataViewer) {
                        this.app.pushScene(new LiveDataViewer(this.app, sensors))
                    }

                    else {
                        this.app.pushScene(new RecordingConfigSelection(this.app, sensors))
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