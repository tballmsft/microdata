namespace microcode {
    let extraImage: Bitmap = null

    //% shim=TD_NOOP
    function extraSamples(name: string) {

    }

    export class icons {
        public static get(name: string, nullIfMissing = false): Bitmap {
            // editor icons
            if (name == "rule_arrow") return icondb.rule_arrow
            if (name == "rule_handle") return icondb.rule_handle
            if (name == "edit_program") return icondb.largeEditIcon
            if (name == "new_program") return icondb.largeNewProgramIcon
            if (name == "MISSING") return icondb.MISSING
            if (name == "disk") return icondb.disk
            if (name == "disk1") return icondb.disk1
            if (name == "largeDisk") return icondb.largeDisk

            // basic colors led editor
            // if (name == "note_on") return icondb.note_on
            // if (name == "note_off") return icondb.note_off

            // Newly added icons for MicroData Home menu:
            if (name == "linear_graph_1") return icondb.linearGraph1
            if (name == "linear_graph_2") return icondb.linearGraph2

            if (name == "led_light_sensor") return icondb.led_light_sensor
            if (name == "thermometer") return icondb.thermometer
            if (name == "accelerometer") return icondb.accelerometer
            if (name == "moveTiltUp") return icondb.moveTiltUp
            if (name == "moveTiltLeft") return icondb.moveTiltLeft
            if (name == "moveTiltRight") return icondb.moveTiltRight
            if (name == "moveTiltDown") return icondb.moveTiltDown
            if (name == "finger_press") return icondb.finger_press
            if (name == "green_tick") return icondb.green_tick

            if (name == "magnet") return icondb.magnet
            if (name == "pin_0") return icondb.pin_0
            if (name == "pin_1") return icondb.pin_1
            if (name == "pin_2") return icondb.pin_2

            if (name == "right_turn") return icondb.car_right_turn
            if (name == "right_spin") return icondb.car_right_spin

            if (name == "speaker") return icondb.speaker

            if (name == "tile_button_a") return icondb.tile_button_a
            if (name == "tile_button_b") return icondb.tile_button_b
            if (name == "compass") return icondb.compass

            if (name == "radio_set_group") return icondb.radio_set_group
            if (name == "settingsGear") return icondb.settingsGear
            if (name == "largeSettingsGear") return icondb.largeSettingsGear
            if (name == "microbitLogoWhiteBackground") return icondb.microbitLogoWhiteBackground

            extraImage = null
            extraSamples(name) // only for web app
            if (extraImage) return extraImage
            if (nullIfMissing) return null
            return icondb.MISSING
        }
    }


export const wordLogo = bmp` 
    ....111111.......111111...1111................................................11111111111.........................1111.................................
    ...11bbbbbb.....11bbbbbb.11bbbb...............................................1bbbbbbbbbbff......................11bbbb................................
    ...1bbbbbbbb...11bbbbbbbf1bbbbbf..............................................1bbbbbbbbbbbff.....................1bbbbbf...............................
    ...1bbbbbbbbb.11bbbbbbbbf1bbbbbf..............................................1bbbbbbbbbbbbff....................1bbbbbf...............................
    ...1bbbbbbbbbb1bbbbbbbbbf1bbbbbf..............................................1bbbbf..bbbbbbf....................1bbbbbf...............................
    ...1bbbbbbbbbbbbbbbbbbbbf.bbbbff..............................................1bbbb....bbbbbff...................1bbbbbf...............................
    ...1bbbbbbbbbbbbbbbbbbbbf..ffff.....1111111......1111...111.......1111111.....1bbbb.....1bbbbf....11111111.......1bbbbbb11111111....11111111...........
    ...1bbbbbbbbbbbbbbbbbbbbf.1111....111bbbbbbb1...11bbbb.11bbb....111bbbbbbb1...1bbbb.....1bbbbf...1bbbbbbbbbf.....1bbbbbbbbbbbbbbf..1bbbbbbbbbf.........
    ...1bbbbbbbbbbbbbbbbbbbbf11bbbb..11bbbbbbbbbbb..1bbbbbb1bbbbb..11bbbbbbbbbbb..1bbbb.....1bbbbf..1bbbbbbbbbbbbf...1bbbbbbbbbbbbbbf.1bbbbbbbbbbbbf.......
    ...1bbbbbbfbbbbbfbbbbbbbf1bbbbbf.1bbbbbbbbbbbbf.1bbbbbbbbbbbbf.1bbbbbbbbbbbbf.1bbbb.....1bbbbf.1bbbbbbbbbbbbbf...1bbbbbbbbbbbbbf.1bbbbbbbbbbbbbf.......
    ...1bbbbbbf.bbbff1bbbbbbf1bbbbbf11bbbbbbbbbbbbb.1bbbbbbbbbbbbf11bbbbbbbbbbbbb.1bbbb.....1bbbbf.1bbbbbbbbbbbbbf...1bbbbbbf........1bbbbbbbbbbbbbbf......
    ...1bbbbbbf..fff.1bbbbbbf1bbbbbf1bbbbbfffbbbbbbf1bbbbbfffbbbff1bbbbbfffbbbbbbfbbbbb.....1bbbbf.1bbbbffffbbbbbf...1bbbbbbf........1bbbbffffbbbbbbf......
    ...1bbbbbbf......1bbbbbbf1bbbbbf1bbbbff...bbbbff1bbbbbf...fff.1bbbbff...bbbbbfbbbbb.....1bbbbf.1bbbff...1bbbbf...1bbbbbbf........1bbbbf...1bbbbbf......
    ...1bbbbbbf......1bbbbbbf1bbbbbf1bbbbf.....ffff.1bbbbbf.......1bbbbf....1bbbbfbbbbb.....1bbbbf.1bbbbf...1bbbbf...1bbbbbbf........1bbbbf...1bbbbbf......
    ...1bbbbbbf......1bbbbbbf1bbbbbf1bbbbf....1111..1bbbbbf.......1bbbbf....1bbbbfbbbbb.....1bbbbf.1bbbbf...1bbbbf...1bbbbbbf........1bbbbf...1bbbbbf......
    ...1bbbbbbf......1bbbbbbf1bbbbbf1bbbbb...11bbbb.1bbbbbf.......1bbbbb...11bbbbfbbbbb....bbbbbbf.1bbbbb...1bbbbf...1bbbbbbf........1bbbbb...1bbbbbf......
    ...1bbbbbbf......1bbbbbbf1bbbbbf1bbbbbb111bbbbbf1bbbbbf.......1bbbbbb111bbbbbfbbbbb...bbbbbbbf.1bbbbb111bbbbbf...1bbbbbbf........1bbbbbb111bbbbbf......
    ...1bbbbbbf......1bbbbbbf1bbbbbf.bbbbbbbbbbbbbff1bbbbbf........bbbbbbbbbbbbbffbbbbbbbbbbbbbbf..bbbbbbbbbbbbb1111.bbbbbbbb11111111bbbbbbbbbbbbbbb1111...
    ...1bbbbbbf......1bbbbbbf1bbbbbf.1bbbbbbbbbbbbf.1bbbbbf........1bbbbbbbbbbbbf.bbbbbbbbbbbbbbf..bbbbbbbbbbbbbbbbbfbbbbbbbbbbbbbbbfbbbbbbbbbbbbbbbbbbbf..
    ...1bbbbbbf......1bbbbbbf1bbbbbf..bbbbbbbbbbbff.1bbbbbf.........bbbbbbbbbbbff.bbbbbbbbbbbbbff..bbbbbbbbbbbbbbbbbfbbbbbbbbbbbbbbbfbbbbbbbbbbbbbbbbbbff..
    ....bbbbbff.......bbbbbff.bbbbff...fbbbbbbbfff...bbbbff..........fbbbbbbbfff..bbbbbbbbbbbff.....fbbbbbbbbbbbbbbbf.fbbbbbbbbbbbbbf.fbbbbbbbbbbbbbbbbff..
    .....fffff.........fffff...ffff......fffffff......ffff.............fffffff....fffffffffff.........ffffffffffffff....ffffffffffff....ffffffffffffffff...
`

export const microbitLogo = bmp`
    ............................
    ......5555555555555555......
    ....55555555555555555555....
    ...5554444444444444444555...
    ..5554.................555..
    ..554...................554.
    .554....55........55.....554
    .55....5555......5555....554
    .55....55554.....55554...554
    .55.....5544......5544...554
    ..55.....44........44...5544
    ..555..................5554.
    ...555................55544.
    ....5555555555555555555544..
    .....45555555555555555444...
    .......4444444444444444.....
`

export const editorBackground = bmp`
    8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    8888888888888888888888188888881888888888881888888888888888888888888888888888888888888888888888888888885888888888888888888881888888888888888888818888888888888188
    8818888888881888888888888888818188888888888888888818888888881888888888818888888888881888888888588888888888888888888888888888888888888858888888888888888888888888
    8888888888888888888888888888881888888888888888888181888888888888888888888888888888888888888888888881888881888888888188888888888888888888888888888888888888888888
    8888588888888818888888888888888888888888888888888818888888888888888888888888888888888888888888888888888888888888881818888888888881888888818888888888818888888888
    8888888888888888888858888888888888188888888888888888888888888888818888888888888188888888888888888888888888888888888188888888888888888888888888888888888888888888
    8888888888888888188888888888888888888881888885888888888888888888888888885888888888888888881888888588888888888888888888888888888888888888888888888588888888888888
    8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    8886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886888688868886
    8686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686868686
    6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
    6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
    6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
    6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666
`
}

namespace icondb {
    const note4x3 = bmp`
        . f f .
        f c c .
        f c c .
    `

    // - upscale 5x5 image to 16 x 16, add halo
    export function renderMicrobitLEDs(led55: Bitmap) {
        const ret = bitmap.create(16, 16)
        ret.fill(15)
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const on = led55.getPixel(row, col)
                if (!on) continue

                const color = 0x2
                const halo = 0xe
                const nrow = 1 + row * 3,
                    ncol = 1 + col * 3
                ret.setPixel(nrow, ncol, color)
                ret.setPixel(nrow + 1, ncol, color)
                ret.setPixel(nrow, ncol + 1, color)
                ret.setPixel(nrow + 1, ncol + 1, color)
                // halo
                /*
                ret.setPixel(nrow - 1, ncol, halo)
                ret.setPixel(nrow - 1, ncol + 1, halo)
                ret.setPixel(nrow + 2, ncol, halo)
                ret.setPixel(nrow + 2, ncol + 1, halo)
                ret.setPixel(nrow, ncol - 1, halo)
                ret.setPixel(nrow + 1, ncol - 1, halo)
                ret.setPixel(nrow, ncol + 2, halo)
                ret.setPixel(nrow + 1, ncol + 2, halo)
                */
            }
        }
        return ret
    }


    export const iconEditor = bmp`
        f f f f f f f f f f f f f f f f 
        f f f f f f f f f f f f f f f f 
        f f f f f f f f f f f f f f f f 
        f f f f e e f f f f e e f f f f 
        f f f e 2 2 e f f e 2 2 e f f f 
        f f f e 2 2 e f f e 2 2 e f f f 
        f f f f e e f f f f e e f f f f 
        f f f f f f f f f f f f f f f f 
        f f f f f f f f f f f f f f f f 
        f e e f f f f f f f f f f e e f 
        e 2 2 e f f f f f f f f e 2 2 e 
        e 2 2 e f f f f f f f f e 2 2 e 
        f e e f e e f e e f e e f e e f 
        f f f e 2 2 e 2 2 e 2 2 e f f f 
        f f f e 2 2 e 2 2 e 2 2 e f f f 
        f f f f e e f e e f e e f f f f 
    `

    function renderImg(i: Bitmap) {
        let r = ""
        for (let y = 0; y < i.height; ++y) {
            let line = ""
            for (let x = 0; x < i.width; ++x)
                line += "0123456789abcdef"[i.getPixel(x, y)] + " "
            r += line + "\n"
        }
        console.log(`\nimg\`\n${r}\``)
    }


    //-------------
    // SMALL ICONS:
    //-------------


    export const melodyEditor = bmp`
        1111111111111111
        111111111ff11111
        11111111fcc11111
        11111111fcc11111
        1111111111111111
        1111111111111111
        1111111111111111
        11111ff111111111
        1111fcc111111111
        1111fcc111111111
        1111111111111111
        1111111111111111
        1111111111111111
        1ff1111111111ff1
        fcc111111111fcc1
        fcc111111111fcc1    
        `

    export const microbitLogoWhiteBackground = bmp`
        11111111111111111
        11115555555551111
        11155555555555111
        11544444444444111
        15541111111114511
        15511111111111541
        55415511115511554
        55155551155551554
        55155554155554554
        55115544115544554
        15511441111441544
        15511111111111541
        11551111111114441
        11155555555555411
        11155555555555111
        11111444444441111
    `

    export const disk = bmp`
        . . . . . . . . . . . . . . . .
        . . 8 d d d d 8 8 d d 8 . . . .
        . . 8 d d d d 8 8 d d 8 8 . . .
        . . 8 d d d d 8 8 d d 8 8 8 . .
        . . 8 d d d d d d d d 8 8 8 . .
        . . 8 8 8 8 8 8 8 8 8 8 8 8 . .
        . . 8 8 3 3 3 3 3 3 3 3 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const disk1 = bmp`
        . . . . . . . . . . . . . . . .
        . . 8 d d d d 8 8 d d 8 . . . .
        . . 8 d d d d 8 8 d d 8 8 . . .
        . . 8 d d d d 8 8 d d 8 8 8 . .
        . . 8 d d d d d d d d 8 8 8 . .
        . . 8 8 8 8 8 8 8 8 8 8 8 8 d .
        . . 8 8 3 3 3 3 3 3 3 3 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 f 1 1 1 8 8 d .
        . . 8 8 1 1 1 f f 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 f 1 1 1 8 8 d .
        . . 8 8 1 1 1 1 f 1 1 1 8 8 d .
        . . 8 8 1 1 1 f f f 1 1 8 8 d .
        . . 8 8 1 1 1 1 1 1 1 1 8 8 . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const MISSING = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . 2 2 2 2 2 2 2 2 2 2 . . .
        . . . 2 2 . . . . . . 2 2 . . .
        . . . 2 . 2 . . . . 2 . 2 . . .
        . . . 2 . . 2 . . 2 . . 2 . . .
        . . . 2 . . . 2 2 . . . 2 . . .
        . . . 2 . . . 2 2 . . . 2 . . .
        . . . 2 . . 2 . . 2 . . 2 . . .
        . . . 2 . 2 . . . . 2 . 2 . . .
        . . . 2 2 . . . . . . 2 2 . . .
        . . . 2 2 2 2 2 2 2 2 2 2 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const rule_arrow = bmp`
        d d d . . . . . . . . . . .
        d d d d . . . . . . . . . .
        d d d d d . . . . . . . . .
        d d d d d d . . . . . . . .
        d d d d d d d . . . . . . .
        d d d d d d d d . . . . . .
        d d d d d d d d d . . . . .
        d d d d d d d d d d . . . .
        d d d d d d d d d d d . . .
        d d d d d d d d d d d d . .
        d d d d d d d d d d d d . .
        d d d d d d d d d d d . . .
        d d d d d d d d d d . . . .
        d d d d d d d d d . . . . .
        d d d d d d d d . . . . . .
        d d d d d d d . . . . . . .
        d d d d d d . . . . . . . .
        d d d d d . . . . . . . . .
        d d d d . . . . . . . . . .
        d d d . . . . . . . . . . .
    `

    export const showScreen = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . 2 4 . .
        . . . . 2 . . . . . . 2 4 4 2 .
        . . . . 2 . . . . . 2 4 4 2 e .
        . 2 . . 2 . . . . 2 4 4 2 e b .
        . . 2 . 2 . . . 2 4 4 2 e b . .
        . . . . . . . d 4 4 2 e b . . .
        . . f f f f f d d 2 e b . . . .
        . . f f f f f 2 d d b . . . . .
        . . f f 2 f 2 f f b . . . . . .
        . . f f f f f f f b . 2 2 2 2 .
        . . f 2 f f f 2 f b . . . . . .
        . . f f 2 2 2 f f b . 2 . . . .
        . . f f f f f f f b . . 2 . . .
        . . . b b b b b b b . . . . . .
        . . . . . . . . . . . . . . . .
    `


    export const green_tick = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 6 6 1
        1 1 1 1 1 1 1 1 1 1 1 1 6 6 6 1
        1 1 1 1 1 1 1 1 1 1 1 6 6 6 6 1
        1 1 1 1 1 1 1 1 1 1 6 6 6 6 6 1
        1 1 1 1 1 1 1 1 1 6 6 6 6 6 1 1
        1 6 1 1 1 1 1 1 6 6 6 6 6 1 1 1
        1 6 6 1 1 1 1 6 6 6 6 6 1 1 1 1
        1 6 6 6 1 1 6 6 6 6 6 1 1 1 1 1
        1 6 6 6 6 6 6 6 6 6 1 1 1 1 1 1
        1 6 6 6 6 6 6 6 6 1 1 1 1 1 1 1
        1 6 6 6 6 6 6 6 1 1 1 1 1 1 1 1
        1 1 6 6 6 6 6 1 1 1 1 1 1 1 1 1
        1 1 1 6 6 6 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `


    export const largeRadio = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . 8 . . . 8 . . . . . .
        . . . 8 . . 8 8 8 . . 8 . . . .
        . 8 . . 8 . . . . . 8 . . 8 . .
        . . 8 . . 8 8 8 8 8 . . 8 . . .
        . . . 8 . . . . . . . 8 . . . .
        . . . . 8 8 8 8 8 8 8 . . . . .
        . . . . . . . . . . . . . . . .
        . . . 6 6 6 . . . . 6 6 6 . . .
        . . 6 9 6 9 6 . . 6 9 6 9 6 . .
        . . . 6 6 6 . . . . 6 6 6 . . .
        . . . . . . . . . . . . . . . .
        . . . 6 6 6 . . . . 6 6 6 . . .
        . . 6 9 6 9 6 . . 6 9 6 9 6 . .
        . . . 6 6 6 . . . . 6 6 6 . . .
        . . . . . . . . . . . . . . . .
    `

    export const settingsGear = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . d d . . . . . . .
        . . . d d . d b b c . d d . . .
        . . d b b c d b b c d b b c . .
        . . d b b b b b b b b b b c . .
        . . . c b d b c c b d b c . . .
        . . d d b b c . . c b b d d . .
        . d b b b c . . . . c b b b c .
        . d b b b c . . . . c b b b c .
        . . c c b b c . . c b b c c . .
        . . . d b d b c c b d b c . . .
        . . d b b b b b b b b b b c . .
        . . d b b c c b b c c b b c . .
        . . . c c . c b b c . c c . . .
        . . . . . . . c c . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const servo_set_angle = bmp`
        . . . . . . . . . . . . . . . . 
        . . . 8 8 8 . . . . 4 . . . . . 
        . . 8 8 8 8 8 . . . 2 . . . . . 
        . . 8 8 8 8 8 . . . 2 4 . . . . 
        . . 8 8 8 8 8 . . . . 2 . . . . 
        . . 8 8 8 8 8 . . . . 2 . . . . 
        . . 8 8 8 8 8 . . . . 2 . . . . 
        . . 8 b b b 8 . . 4 . 2 . 4 . . 
        . . 8 b c b b . . 2 4 2 4 2 . . 
        . . 8 b c c b . . . 2 2 2 . . . 
        . . 8 8 b b c b . . . 2 . . . . 
        . . 8 8 8 8 b c b . . . . . . . 
        . . 8 8 8 8 8 b c b . . . 5 5 5 
        . . 8 8 8 8 8 . b c b . . 5 5 5 
        . . . 8 8 8 . . . b c . . 5 5 4 
        . . . . . . . . . . . b . 4 4 . 
    `

    ///
    /// HARDWARE-SPECIFIC LANGUAGE TILES
    ///
    export const tile_button_a = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . 8 . . .
        . . . . . . . . . . . 8 8 d . .
        . . . . . . . . . . 8 8 8 d . .
        . . . . . . . . . 8 8 8 8 d . .
        . . . . . . . . 8 8 8 8 8 d . .
        . . . . . . . 8 8 8 1 8 8 d . .
        . . . . . . 8 8 8 1 8 1 8 d . .
        . . . . . 8 8 8 8 1 1 1 8 d . .
        . . . . 8 8 8 8 8 1 8 1 8 d . .
        . . . 8 8 8 8 8 8 1 8 1 8 d . .
        . . 8 8 8 8 8 8 8 8 8 8 8 d . .
        . . . d d d d d d d d d d d . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const tile_button_b = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . 8 8 8 8 8 8 8 8 8 8 8 . . .
        . . 8 1 1 8 8 8 8 8 8 8 d d . .
        . . 8 1 8 1 8 8 8 8 8 d d . . .
        . . 8 1 1 8 8 8 8 8 d d . . . .
        . . 8 1 8 1 8 8 8 d d . . . . .
        . . 8 1 1 8 8 8 d d . . . . . .
        . . 8 8 8 8 8 d d . . . . . . .
        . . 8 8 8 8 d d . . . . . . . .
        . . 8 8 8 d d . . . . . . . . .
        . . 8 8 d d . . . . . . . . . .
        . . 8 d d . . . . . . . . . . .
        . . . d . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const pin_0 = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 4 4 4 4 4 1 1 1 4 4 1 1 1
        1 4 4 4 1 1 4 4 1 4 4 4 4 1 1
        1 4 4 4 1 1 1 4 4 4 1 1 4 4 1
        1 4 4 4 1 1 4 4 4 4 1 1 4 4 1
        1 4 4 4 4 4 4 1 4 4 1 1 4 4 1 
        1 4 4 4 1 1 1 1 4 4 1 1 4 4 1 
        1 4 4 4 1 1 1 1 4 4 1 1 4 4 1 
        1 4 4 4 1 1 1 1 4 4 1 1 4 4 1 
        1 4 4 4 1 1 1 1 4 4 1 1 4 4 1 
        1 4 4 4 1 1 1 1 4 4 1 1 4 4 1 
        1 4 4 4 1 1 1 1 1 4 4 4 4 1 1 
        1 1 4 1 1 1 1 1 1 1 4 4 1 1 1 
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    export const pin_1 = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 4 4 4 4 4 1 1 4 4 4 4 1 1
        1 4 4 4 1 1 4 4 4 4 4 4 4 1 1
        1 4 4 4 1 1 1 4 4 4 4 4 4 1 1
        1 4 4 4 1 1 4 4 1 1 4 4 4 1 1
        1 4 4 4 4 4 4 1 1 1 4 4 4 1 1
        1 4 4 4 1 1 1 1 1 1 4 4 4 1 1
        1 4 4 4 1 1 1 1 1 1 4 4 4 1 1
        1 4 4 4 1 1 1 1 1 1 4 4 4 1 1
        1 4 4 4 1 1 1 1 1 1 4 4 4 1 1
        1 4 4 4 1 1 1 1 1 1 4 4 4 1 1
        1 4 4 4 1 1 1 1 4 4 4 4 4 4 1
        1 1 4 1 1 1 1 4 4 4 4 4 4 4 4
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `


    export const pin_2 = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 4 4 4 4 4 1 1 4 4 4 4 1 1
        1 4 4 4 1 1 4 4 4 4 4 4 4 4 1
        1 4 4 4 1 1 1 4 4 4 1 1 4 4 4
        1 4 4 4 1 1 4 4 4 1 1 1 4 4 4
        1 4 4 4 4 4 4 1 1 1 1 1 4 4 4
        1 4 4 4 1 1 1 1 1 1 1 4 4 4 1
        1 4 4 4 1 1 1 1 1 1 1 4 4 4 1
        1 4 4 4 1 1 1 1 1 1 4 4 4 1 1
        1 4 4 4 1 1 1 1 1 4 4 4 4 1 1
        1 4 4 4 1 1 1 1 4 4 4 4 1 1 1
        1 4 4 4 1 1 1 4 4 4 4 4 4 4 4
        1 1 4 1 1 1 1 4 4 4 4 4 4 4 4
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    export const compass = bmp`
        1 1 1 1 5 5 5 5 5 5 5 1 1 1 1
        1 1 1 5 5 5 5 5 5 5 5 5 1 1 1
        1 1 5 5 5 f f f f f 5 5 5 1 1
        1 5 5 5 f f f f f f 2 5 5 5 1
        5 5 5 f f f f f f 2 2 2 5 5 5
        5 5 f f f f f f 2 2 2 f f 5 5
        5 f f f f f f 2 2 2 f f f f 5
        5 f f f f f 1 1 1 2 f f f f 5
        5 f f f f 8 1 1 1 f f f f f 5
        5 f f f 8 8 1 1 1 f f f f f 5
        5 5 f 8 8 8 8 f f f f f f 5 5
        5 5 5 8 8 8 f f f f f f 5 5 5
        1 5 5 5 8 f f f f f f 5 5 5 1
        1 1 5 5 5 f f f f f 5 5 5 1 1
        1 1 1 5 5 5 5 5 5 5 5 5 1 1 1
        1 1 1 1 5 5 5 5 5 5 5 1 1 1 1
    `

    export const car_right_turn = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 c c c 1 1 1 1 1
        1 1 1 1 1 1 1 1 c 7 7 c 1 1 1 1
        1 1 1 1 1 c c c c 7 7 7 c 1 1 1
        1 1 1 1 c 7 7 7 7 7 7 7 7 c 1 1
        1 1 1 c 7 7 7 7 7 7 7 7 7 7 c 1
        1 1 c 7 7 7 7 7 7 7 7 7 7 c 1 1
        1 c 7 7 7 7 7 c c 7 7 7 c 1 1 1
        1 c 7 7 7 7 c 1 c 7 7 c 1 1 1 1
        1 c 7 7 7 c d 1 c c c 1 1 1 1 1
        1 c 7 7 7 c d 1 1 1 1 1 1 1 1 1
        1 c 7 7 7 c d 1 1 1 1 1 1 1 1 1
        1 c 7 7 7 c d 1 1 1 1 1 1 1 1 1
        1 c 7 7 7 c d 1 1 1 1 1 1 1 1 1
        1 c c c c c 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    export const car_right_spin = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 c c c c c 1 1 1 1 1 1
        1 1 1 1 c 7 7 7 7 7 c 1 1 1 1 1
        1 1 1 c 7 7 7 7 7 7 7 c 1 1 1 1 
        1 1 c 7 7 7 7 7 7 7 7 7 c 1 1 1
        1 c 7 7 7 7 7 c c 7 7 7 c 1 1 1
        c 7 7 7 7 7 c c c 7 7 7 c c c 1
        c 7 7 7 7 c c 7 7 7 7 7 7 7 c d
        c 7 7 7 c d c 7 7 7 7 7 7 7 c d
        c 7 7 7 c d 1 c 7 7 7 7 7 c d 1
        c 7 7 7 c d 1 1 c 7 7 7 c d 1 1
        c 7 7 7 c d 1 1 1 c 7 c d 1 1 1
        c 7 7 7 c 1 1 1 1 1 c d 1 1 1 1
        c c c c c 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1    
    `

    export const moveTiltRight = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . 8 . . . . . . . . . .
        . . . . . 8 8 . f f . . . . . .
        . . . 8 8 8 8 8 f 5 f . . . . .
        . . 8 . . 8 8 9 f 5 5 8 9 9 . .
        . 8 . . . 8 9 9 f 5 5 6 8 9 . .
        . 8 . . . 9 9 9 f 5 5 6 8 9 . .
        . 8 . . . 9 9 9 f 5 5 6 8 9 . .
        . . 8 . . 9 9 9 f 5 5 6 8 9 . .
        . . . . . 9 9 9 f 5 5 6 8 9 . .
        . . . . . 9 9 9 f 5 5 6 8 9 . .
        . . . . . 9 9 9 f 5 5 8 9 9 . .
        . . . . . . . . f 5 f . . . . .
        . . . . . . . . f f . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const rule_handle = bmp`
        . f f f f f f f .
        f 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 f
        f 1 1 1 1 1 1 1 f
        . f f f f f f f .
    `

    export const microbit_logo = bmp`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . 4 4 4 4 4 4 4 4 d . . . 
        . . . 4 d 5 5 5 5 5 5 5 4 d . . 
        . . 4 d . . . . . . . . 5 4 d . 
        . . 4 d 4 4 d . . . 4 4 d 4 d . 
        . . 4 d 4 4 d . . . 4 4 d 4 d . 
        . . 4 d . 5 5 . . . . 5 5 4 d . 
        . . . 4 d . . . . . . . 4 d . . 
        . . . . 4 4 4 4 4 4 4 4 d . . . 
        . . . . . 5 5 5 5 5 5 5 . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
    `


    export const microbit_logo_btn = bmp`
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . f f f f f f f f . . . . 
        . . . f 1 1 1 1 1 1 1 1 f . . . 
        . . f 1 1 1 1 1 1 1 1 1 1 f . . 
        . . f 1 f f 1 1 1 1 f f 1 f . . 
        . . f 1 f f 1 1 1 1 f f 1 f . . 
        . . f 1 1 1 1 1 1 1 1 1 1 f . . 
        . . . f 1 1 1 1 1 1 1 1 f . . . 
        . . . . f f f f f f f f . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . . 
        . . . . . . . . . . . . . . . .
    `

    export const finger_press = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 f 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 f 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 f 1 1 1 1 1 1 1 1
        1 1 1 1 1 f 1 f 1 f 1 1 1 1 1 1
        1 1 1 1 1 1 f f f 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 f 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 4 4 4 4 4 1 1 1 1 1 1
        1 1 1 1 4 4 4 4 4 4 4 d 1 1 1 1
        1 1 1 e 4 4 4 4 4 4 4 e d 1 1 1
        1 1 1 e 2 4 4 4 4 4 2 e d 1 1 1
        1 1 1 e e 2 2 2 2 2 e e d 1 1 1
        1 1 1 1 e e e e e e e d 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    export const finger_release = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . f . . . . . . . .
        . . . . . . f f f . . . . . . .
        . . . . . f . f . f . . . . . .
        . . . . . . . f . . . . . . . .
        . . . . . . . f . . . . . . . .
        . . . . . . . f . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . 4 4 4 4 4 . . . . . .
        . . . . 4 4 4 4 4 4 4 d . . . .
        . . . e 4 4 4 4 4 4 4 e d . . .
        . . . e 2 4 4 4 4 4 2 e d . . .
        . . . e e 2 2 2 2 2 e e d . . .
        . . . . e e e e e e e d . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const magnet = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 6 1 1 1 
        1 1 1 1 1 1 1 1 1 1 6 1 1 1 6 1 
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 
        1 1 1 8 8 8 8 8 f f 1 1 6 1 1 1 
        1 1 8 8 8 8 8 8 f f 1 1 1 1 1 6 
        1 8 8 8 b b b b b b 1 1 6 1 1 1 
        1 8 8 b 1 1 1 1 1 1 1 1 1 1 6 1 
        1 8 8 1 1 1 1 1 1 1 1 6 1 1 1 1 
        1 2 2 1 1 1 1 1 1 1 1 1 1 6 1 1 
        1 2 2 1 1 1 1 1 1 1 1 6 1 1 1 1 
        1 2 2 2 1 1 1 1 1 1 1 1 1 1 6 1 
        1 b 2 2 2 2 2 2 f f 1 1 6 1 1 1 
        1 1 b 2 2 2 2 2 f f 1 1 1 5 5 5 
        1 1 1 b b b b b b b 1 1 6 5 5 5 
        1 1 1 1 1 1 1 1 1 1 1 1 1 5 5 4 
        1 1 1 1 1 1 1 1 1 1 6 1 1 4 4 1 
    `

    export const thermometer = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 f 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 f d f 1 1 1 1 1 1 1
        1 1 1 1 1 1 f d f 1 1 1 1 1 1 1
        1 1 1 1 1 1 f d f 1 1 1 1 1 1 1
        1 1 1 1 1 1 f d f 1 1 1 1 1 1 1
        1 1 1 1 1 1 f 2 f 1 1 1 1 1 1 1
        1 1 1 1 1 1 f 2 f 1 1 1 1 1 1 1
        1 1 1 1 1 1 f 2 f 1 1 1 1 1 1 1
        1 1 1 1 1 1 f 2 f 1 1 1 1 1 1 1
        1 1 1 1 1 f 2 2 2 f 1 1 1 1 1 1
        1 1 1 1 f 2 2 2 2 2 f 1 1 1 1 1
        1 1 1 1 f 2 2 2 2 2 f 1 1 1 1 1
        1 1 1 1 1 f 2 2 2 f 1 1 1 1 1 1
        1 1 1 1 1 1 f f f 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    export const led_light_sensor = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 8 8 8 8 5 5 5 8 8 8 8 1 1 1
        1 1 8 8 8 5 4 4 4 5 8 8 8 1 1 1
        1 1 8 8 8 5 4 4 4 5 8 8 8 1 1 1
        1 1 8 8 8 5 4 4 4 5 8 8 8 1 1 1
        1 1 8 8 8 8 5 5 5 8 8 8 8 1 1 1
        1 1 8 8 5 8 8 8 8 8 5 8 8 1 1 1
        1 1 8 5 8 8 8 5 8 8 8 5 8 1 1 1
        1 1 8 8 8 5 8 8 8 5 8 8 8 1 1 1
        1 1 8 8 5 8 8 5 8 8 5 8 8 1 1 1
        1 1 8 5 8 8 8 8 8 8 8 5 8 1 1 1
        1 1 8 8 8 8 8 5 8 8 8 8 8 1 1 1
        1 1 8 8 8 8 8 8 8 8 8 8 8 1 1 1
        1 1 8 8 8 2 2 2 2 2 8 8 8 1 1 1
        1 1 8 f f f f f f f f f 8 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    export const light_sensor = bmp`
        . . . . . . . . . . . . . . . .
        . . 8 8 8 8 5 5 5 8 8 8 8 . . .
        . . 8 8 8 5 4 4 4 5 8 8 8 . . .
        . . 8 8 8 5 4 4 4 5 8 8 8 . . .
        . . 8 8 8 5 4 4 4 5 8 8 8 . . .
        . . 8 8 8 8 5 5 5 8 8 8 8 . . .
        . . 8 8 5 8 8 8 8 8 5 8 8 . . .
        . . 8 5 8 8 8 5 8 8 8 5 8 . . .
        . . 8 8 8 5 8 8 8 5 8 8 8 . . .
        . . 8 8 5 8 8 5 8 8 5 8 8 . . .
        . . 8 5 8 8 8 8 8 8 8 5 8 . . .
        . . 8 8 8 8 8 5 8 8 8 8 8 . . .
        . . 8 8 8 8 8 8 8 8 8 8 8 5 5 5
        . . 8 8 8 2 2 2 2 2 8 8 8 5 5 5
        . . 8 f f f f f f f f f 8 5 5 4
        . . . . . . . . . . . . . 4 4 .
    `

    export const microphone = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . b c . . . . . . .
        . . . . . . b c c c . . . . . .
        . . . . . . b c c c . . . . . .
        . . . . . . b c c c . . . . . .
        . . . . . . b c c c . . . . . .
        . . . . f . c c c c . f . . . .
        . . . . f . c c c c . f . . . .
        . . . . f . . c c . . f . . . .
        . . . . . f . . . . f . . . . .
        . . . . . . f f f f . . . . . .
        . . . . . . . f f . . . . . . .
        . . . . . . . f f . . . . . . .
        . . . . . f f f f f f . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const speaker = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 c 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 c b 1 1 1 1 1 8 1 1 1 1
        1 1 1 c b c 1 1 1 8 1 1 8 1 1 1
        1 c c b c c 1 8 1 1 8 1 8 1 1 1
        1 b b c c c 1 1 8 1 8 1 8 1 1 1
        1 c c c c c 1 1 8 1 8 1 8 1 1 1
        1 c c c c c 1 8 1 1 8 1 8 1 1 1
        1 1 1 c c c 1 1 1 8 1 1 8 1 1 1
        1 1 1 1 c c 1 1 1 1 1 8 1 1 1 1
        1 1 1 1 1 c 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    export const accelerometer = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 8 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 8 8 8 1 1 1 1 1 1
        1 1 1 1 1 1 8 8 8 8 8 1 1 1 1 1
        1 1 1 1 1 1 6 6 8 6 6 1 1 1 1 1
        1 1 1 1 1 1 1 1 8 1 1 1 1 1 1 1
        1 1 8 6 1 1 f f f f f 1 1 1 1 1
        1 8 8 6 1 f 1 1 1 1 1 f 1 1 1 1
        8 8 8 8 8 f 1 f 1 f 1 f 1 1 1 1
        1 8 8 6 1 f 1 1 1 1 1 f 1 1 1 1
        1 1 8 6 1 1 f f f f f 8 1 1 6 1
        1 1 1 1 1 1 1 1 1 1 1 1 8 6 8 1
        1 1 1 1 1 1 1 1 1 1 1 1 6 8 8 1
        1 1 1 1 1 1 1 1 1 1 1 6 8 8 8 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    export const moveTiltDown = bmp`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . 8 8 8 8 . . . . .
        . . . . . . 8 . . . . . . . . .
        . . . . . 8 . . . . . . . . . .
        . . . 8 8 8 8 8 . . . . . . . .
        . . . . 8 8 8 9 9 9 9 9 9 9 . .
        . . . . 9 8 9 9 9 9 9 9 9 9 . .
        . . . . 9 9 9 9 9 9 9 9 9 9 . .
        . f f f f f f f f f 9 9 9 9 . .
        . . f 5 5 5 5 5 5 5 f 9 9 9 . .
        . . . f 5 5 5 5 5 5 5 f 9 9 . .
        . . . . f 5 5 5 5 5 5 5 f 9 . .
        . . . . . f f f f f f f f f . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `

    export const moveTiltUp = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 8 8 8 8 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 8 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 8 1 1 1 1
        1 1 1 1 1 1 1 1 1 8 8 8 8 8 1 1
        1 1 9 9 9 9 9 9 9 9 8 8 8 1 1 1
        1 1 9 9 9 9 9 9 9 9 9 8 1 1 1 1
        1 1 9 9 9 9 9 9 9 9 9 1 1 1 1 1
        1 1 9 9 9 9 8 8 8 8 8 f f f 1 1
        1 1 9 9 9 8 6 6 6 6 6 5 f 1 1 1
        1 1 9 9 8 6 6 6 6 6 6 f 1 1 1 1
        1 1 9 8 6 6 6 6 6 6 8 1 1 1 1 1
        1 1 8 8 8 8 8 8 8 8 9 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `
    export const moveTiltLeft = bmp`
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 8 1 1 1 1 1
        1 1 1 1 1 1 f f 1 8 8 1 1 1 1 1
        1 1 1 1 1 f 5 f 8 8 8 8 8 1 1 1
        1 1 9 9 8 5 5 f 9 8 8 1 1 8 1 1
        1 1 9 8 6 5 5 f 9 9 8 1 1 1 8 1
        1 1 9 8 6 5 5 f 9 9 9 1 1 1 8 1
        1 1 9 8 6 5 5 f 9 9 9 1 1 1 8 1
        1 1 9 8 6 5 5 f 9 9 9 1 1 8 1 1
        1 1 9 8 6 5 5 f 9 9 9 1 1 1 1 1
        1 1 9 8 6 5 5 f 9 9 9 1 1 1 1 1
        1 1 9 9 8 5 5 f 9 9 9 1 1 1 1 1
        1 1 1 1 1 f 5 f 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 f f 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
    `

    //-------------
    // Large Icons:
    //-------------

    export const largeEditIcon = bmp`
        .666666666666666666666666666666.
        66666666666666666666666666666666
        66666666666666666666666666666666
        666666666666666666666666ee666666
        66666666666666666666666e44e66666
        6666666666666666666666ee442e6666
        666666666666666666666e15e222e666
        66666666666666666666e155ee2ee666
        6666666666666666666e155e44eee666
        666666666666666666e155e44eee6666
        ccccccccccccccccce155e44eeeccccc
        bbbbbbbbbbbbbbbbe155e44eeebbbbbb
        bbbbbbbbbbbbbbbe155e44eeebbbbbbb
        111111bbb11111e155e44eeebcbcbcbb
        1111111b11111e155e44eeebbbbbbbcb
        1111111b1111ede5e44eeebbbbbbbbbb
        1111111b1111edde44eeebbbbbbbbbcb
        1111111b1111edddeeeebbbbb1bbbbbb
        1111111b1111eedddeebcbbb111bbbcb
        1111111b1111eeeeee1bbbbbc1cbbbbb
        1111111b11111111111bcbbbbcbbbbcb
        1111111b11111111111bbbbbbbbbbbbb
        111111cbc111111111cbcbbbbbbbbbcb
        ccccccbbbcccccccccbbbcbcbcbcbcbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        cccccccccccccccccccccccccccccccc
        66666666666666666666666666666666
        66666666666666666666666666666666
        66666666666666666666666666666666
        66666666666666666666666666666666
        b666666666666666666666666666666b
        .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
    `

    export const largeSettingsGear = bmp`
        66666666666666666666666666666666
        66666666666666666666666666666666
        666666666666666dd666666666666666
        66666666666666dddd66666666666666
        66666dddd666ddbbbbcc666dddd66666
        66666dddd666ddbbbbcc666dddd66666
        666dddbbbb66ddbbbbcc66dbbbccc666
        666dddbbbbccddbbbbccdddbbbccc666
        6666ddbbbbbbbbbbbbbbbbbbbbcc6666
        66666dbbbbbbbbbbbbbbbbbbbbc66666
        666666ccbbddbbccccbbddbbcc666666
        666666ccbbddbbc66cbbddbbcc666666
        66666dddbbbbcc6666ccbbbbdddd6666
        6666ddddbbbbc666666cbbbbdddd6666
        666dbbbbbbcc66666666ccbbbbbbc666
        6dddbbbbbbc6666666666cbbbbbbccc6
        6dddbbbbbbc6666666666cbbbbbbccc6
        6dddbbbbbbcc66666666ccbbbbbbccc6
        666cccccbbbbc6666666cbbbbcccc666
        6666ccccbbbbcc66666ccbbbbccc6666
        666666ddbbddbbc66cbbddbbcc666666
        666666ddbbddbbccccbbddbbcc666666
        66666dbbbbbbbbbbbbbbbbbbbbc66666
        6666ddbbbbbbbbbbbbbbbbbbbbcc6666
        6666ddbbbbccccbbbbccccbbbbcc6666
        6666ddbbbb66ccbbbbcc66bbbbcc6666
        66666cccc666ccbbbbcc666cccc66666
        66666cccc666ccbbbbcc666cccc66666
        66666666666666cccc66666666666666
        666666666666666cc666666666666666
        66666666666666666666666666666666
        66666666666666666666666666666666
    `

    export const largeNewProgramIcon = bmp`
        .11111111..............11111111.
        1bbbbbbbb..............bbbbbbbb1
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        b..............................b
        ................................
        ...............11...............
        ...............11...............
        ...............11...............
        ...............11...............
        ...........1111111111...........
        ...........1111111111...........
        ...........bbbb11bbbb...........
        ...............11...............
        ...............11...............
        ...............11...............
        ...............bb...............
        ................................
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        1..............................1
        b11111111..............11111111b
        .bbbbbbbb..............bbbbbbbb.
    `

    export const linearGraph1 = bmp`
        .111111111111111111111111111111.
        11111111111111111111111111111111
        11ff1111111111111111111111111111
        11ff1111111111111111111111114111
        11ff1111111111111111111111144111
        11ff1111111111111111111111441111
        11ff1111111111111111111114411111
        11ff1111111111111111111144111111
        11ff1111111111111111111441111111
        11ff1111111111111111114411111111
        11ff1111111111111111144111111111
        11ff1111111111111111441111111111
        11ff1111111111111114411111111111
        11ff1111111111111144111111111111
        11ff1111111111111441111111111111
        11ff1111111111114411111111111111
        11ff1111111111144111111111111111
        11ff1111111111441111111111111111
        11ff1111111114411111111111111111
        11ff1111111144111111111111111111
        11ff1111111441111111111111111111
        11ff1111114411111111111111111111
        11ff1111144111111111111111111111
        11ff1111441111111111111111111111
        11ff1114411111111111111111111111
        11ff1144111111111111111111111111
        11ff1441111111111111111111111111
        11ff4411111111111111111111111111
        11ff4111111111111111111111111111
        11ffffffffffffffffffffffffffff11
        11ffffffffffffffffffffffffffff11
        1111111111111111111111111111111b
        .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
    `

    export const linearGraph2 = bmp`
        .111111111111111111111111111111.
        11111111111111111111111111111111
        11ff1111111111111111111111111111
        11ff1111111111111111111111141111
        11ff1111111111111111111111441111
        11ff1111111111111111111114411888
        11ff1111111111111111111144188881
        11ff1111111111111111111448881111
        11ff1111111111111111114888111111
        11ff1111111111111111888111111111
        11ff1111111111111188441111111111
        11ff1111111111118884411111111111
        11ff1111111111188144111111111111
        11ff1111111118811441111111111111
        11ff1111111188114411111111111111
        11ff1111111881144111111111111111
        11ff1111118811441111111111111111
        11ff1111188114411111111111111111
        11ff1111881144111111111111111111
        11ff1118811441111111111111111111
        11ff1188114411111111111111111111
        11ff1881144111111111111111111111
        11ff1811441111111111111111111111
        11ff8814411111111111111111111111
        11ff8844111111111111111111111111
        11ff8441111111111111111111111111
        11ff8441111111111111111111111111
        11ff4411111111111111111111111111
        11ff4111111111111111111111111111
        11ffffffffffffffffffffffffffff11
        11ffffffffffffffffffffffffffff11
        1111111111111111111111111111111b
        .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
    `

    export const radio_set_group = bmp`
        .666666666666666666666666666666.
        66666666666666666666666666666666
        66666666666666666666666666666666
        66666666688888888888888666666666
        66666666688888888888888666666666
        66666668866666666666666886666666
        66666668866666666666666886666666
        66666886666888888888866668866666
        66666886666888888888866668866666
        66688666688666666666688666688666
        66688666688666666666688666688666
        66666668866668888886666886666666
        66666668866668888886666886666666
        66666666666886666668866666666666
        66666666666886666668866666666666
        66666666666666644666666666666666
        66666666666666644666666666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        66666666666445555554466666666666
        66666666666445555554466666666666
        66666666644555555555544666666666
        66666666644555555555544666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        66666666666664455446666666666666
        .666666666666666666666666666666.
    `

    export const largeDisk = bmp`
        .666666666666666666666666666666.
        66666666666666666666666666666666
        66666666666666666666666666666666
        66666bbbbbbbbbbbbbbbbbbbb6666666
        6666bb8cdddddddddddd888c8b666666
        6666b88cdddddddc88dd888c88b66666
        6666b88cddddddd888dd888c888b6666
        6666b88cddddddd888dd888c888b6666
        6666b88cddddddd888dd888c888b6666
        6666b88cddddddd888dd888c888b6666
        6666b88cdddddddddddd888c888b6666
        6666b88ccccccccccccccccc888b6666
        6666b8888888888888888888888b6666
        6666b8888888888888888888888b6666
        6666b8833333333333333333888b6666
        6666b8833333333333333333888b6666
        6666b8811111111111111111888b6666
        6666b8811111111111111111888b6666
        6666b8811ccccc1111111111888b6666
        6666b8811111111111111111888b6666
        6666b8811ccc111111111111888b6666
        6666b8811111111111111111888b6666
        6666b8811ccccccc11111111888b6666
        6666b8811111111111111111888b6666
        6666b8811111111111111111888b6666
        6666b88111111111111111118f8b6666
        6666b88111111111111111118f8b6666
        6666bb811111111111111111888b6666
        66666bbbbbbbbbbbbbbbbbbbbbbb6666
        66666666666666666666666666666666
        66666666666666666666666666666666
        b666666666666666666666666666666b
        .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
    `

    export const largeMetaDataIcon = bmp`
        .666666666666666666666666666666.
        66666666666666666666666666666666
        66666666666666666666666666666666
        6666bbbbbbbbbbbbbbbbbbbbbb666666
        666bb811111111111111111118b66666
        666b88111111111111111111188b6666
        666b881111111111111111111888b666
        666b881111111111111111111888b666
        666b881111111111111111111888b666
        666b881111111111111111111888b666
        666b881111111111111111111888b666
        666b881111111111111111111888b666
        6666b88ccccc111111111cccccc88b66
        6666bcccccddb111111cbbccccc88b66
        6666bccccdbbbbbbbbbbcccc8888b666
        6666b8cccccddbcccbdcccc88888b666
        6666b888dbbcc11111cbddd88888b666
        6666bddbbbcc111111cccbbb8888b666
        66ddddbbb11111111111bbbcccc8b666
        66ddddbbb11111111111bbbcccc8b666
        6666bddbbbcc111111ccbbbc8888b666
        6666b888cbbcc11111cbbcc88888b666
        666b888ccccddbcccbdcccc88888b666
        666b88cccdbbbbbbbbbbcccc8888b666
        666bcccccddb1111111cbbccccc8b666
        666b8ccccc1111111111ccccc888b666
        666b8811111111111111111118f8b666
        666bb81111111111111111111888b666
        6666bbbbbbbbbbbbbbbbbbbbbbbbb666
        66666666666666666666666666666666
        66666666666666666666666666666666
        b666666666666666666666666666666b
        .bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.
    `
}