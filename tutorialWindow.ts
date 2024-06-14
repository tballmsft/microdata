namespace microcode {
    const MAX_NUMBER_OF_TUTORIAL_TIPS_ON_SCREEN: number = 3
    
    /**
     * A single paragraph that contains an important point for the user.
     * Keywords may be passed - each keyword will be coloured.
     */
    type TutorialTip = {
        text: string,
        keywords?: string[],
        keywordColors?: number[],
    }


    /**
     * Owned via composition by the live-data-viewer and the recordingConfigSelection.
     * Displays a scrollable sub-window filled with custom & coloured text - specified by the TutorialTip
     * The owner should restate their control schema: UP, DOWN, A, B are used by the TutorialWindow.
     */
    export class TutorialWindow extends Scene {
        private tutorialTextTips: TutorialTip[];
        private numberOfTips: number
        private tutorialTextIndexOffset: number;
        private nextScene: Scene;
        private backFn: () => void;

        constructor(
            app: App,
            opts: {tips: TutorialTip[], backFn: () => void}, 
            nextScene: Scene,
        ){
            super(app, "tutorialWindow")
            this.tutorialTextTips = opts.tips;
            this.numberOfTips = opts.tips.length;
            this.tutorialTextIndexOffset = 0;
            this.nextScene = nextScene;
            this.backFn = opts.backFn;

            basic.pause(5)
        }

        /* override */ startup() {
            super.startup()
            
            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.A.id,
                () => {
                    this.app.popScene()
                    this.app.pushScene(this.nextScene)
                }
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.B.id,
                () => this.backFn()
            )

            // Unbind:
            control.onEvent(ControllerButtonEvent.Pressed, controller.left.id, () => {})
            control.onEvent(ControllerButtonEvent.Pressed, controller.right.id, () => {})

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.up.id,
                () => this.tutorialTextIndexOffset = Math.max(this.tutorialTextIndexOffset - 1, 0)
            )

            control.onEvent(
                ControllerButtonEvent.Pressed,
                controller.down.id,
                () => this.tutorialTextIndexOffset = Math.min(this.tutorialTextIndexOffset + 1, this.tutorialTextTips.length - MAX_NUMBER_OF_TUTORIAL_TIPS_ON_SCREEN)
            )
        }

        draw() {
            Screen.fillRect(
                Screen.LEFT_EDGE,
                Screen.TOP_EDGE,
                Screen.WIDTH,
                Screen.HEIGHT,
                0xC
            )

            const headerX = Screen.HALF_WIDTH
            const headerY = Screen.HALF_HEIGHT - 60 + 8

            //-------------
            // Draw Window:
            //-------------

            const subWindowRightEdge = Screen.HALF_WIDTH + 70;
            const subWindowTopEdge = Screen.HALF_HEIGHT - 60
            const subWindowWidth = 140
            const subWindowHeight = 120

            // Sub-window:
            // Outline:
            screen.fillRect(
                Screen.HALF_WIDTH - 70,
                subWindowTopEdge,
                subWindowWidth,
                subWindowHeight,
                15 // Black
            )

            screen.fillRect(
                Screen.HALF_WIDTH - 70 + 3,
                subWindowTopEdge + 3,
                subWindowWidth - 6,
                subWindowHeight - 6,
                3 // Pink
            )

            //------------
            // Draw Title:
            //------------

            const tutorialTextLength = ("Tutorial".length * font.charWidth)
            screen.print(
                "Tutorial",
                headerX - (tutorialTextLength / 2),
                headerY,
                15 // Black
            )
                
            // Underline the title:
            screen.fillRect(
                headerX - (tutorialTextLength / 2) - 3,
                subWindowTopEdge + 16,
                tutorialTextLength + 4,
                1,
                15 // Black
            )

            //-----------
            // Scrollbar:
            //-----------

            screen.fillRect(
                subWindowRightEdge - 8,
                subWindowTopEdge + 10 + (this.tutorialTextIndexOffset / (this.numberOfTips - MAX_NUMBER_OF_TUTORIAL_TIPS_ON_SCREEN)) * (subWindowHeight - 20),
                3,
                6,
                15 // Black
            )


            //---------------------
            // Write Tutorial Tips:
            //---------------------

            // Some tutorials have coloured keywords, the text is printed in all black first, then the keyword is printed ontop:

            let tutorialTextYOffset = 25
            const tipsOnScreen = Math.min(this.tutorialTextTips.length, this.tutorialTextIndexOffset + MAX_NUMBER_OF_TUTORIAL_TIPS_ON_SCREEN)

            this.tutorialTextTips.slice(this.tutorialTextIndexOffset, tipsOnScreen).forEach((tip) => {
                screen.print(
                    tip.text,
                    headerX - 55,
                    tutorialTextYOffset,
                    15 // Black
                )

                // Keyword highlighting:
                if (tip.keywords != null) {
                    for (let id = 0; id < tip.keywords.length; id++) {
                        let keyword = tip.keywords[id]

                        const keywordIndex = tip.text.indexOf(keyword)
                        const stringBeforeKeyword = tip.text.split(keyword, keywordIndex)[0]
                        const newlinesBeforeKeyword = stringBeforeKeyword.split("\n", keywordIndex)

                        // Find the position of the last newline before the keyword:
                        let newlineBeforeKeywordIndex = 0
                        for (let i = keywordIndex; i > 0; i--) {
                            if (stringBeforeKeyword.charAt(i) == "\n") {
                                newlineBeforeKeywordIndex = i
                                break
                            }
                        }

                        // Qty of characters between the last newline before the keyword is the xOffset:
                        let xOffset = (keywordIndex - newlineBeforeKeywordIndex) * font.charWidth

                        // Account for newline char:
                        if (newlineBeforeKeywordIndex != 0) {
                            xOffset -= 1 * font.charWidth
                        }
                        
                        // Number of newlines before the keyword are pushed infront:
                        for (let _ = 0; _ < newlinesBeforeKeyword.length - 1; _++) {
                            keyword = "\n" + keyword
                        }

                        // Print them directly ontop of the word in black, but with the specified colouring:
                        screen.print(
                            keyword, 
                            headerX - 55 + xOffset,
                            tutorialTextYOffset,
                            tip.keywordColors[id],
                        )
                    }
                }

                // Bullet point:
                screen.fillCircle(
                    headerX - 61,
                    tutorialTextYOffset + 4,
                    2,
                    15 // Black
                )
                
                tutorialTextYOffset += (tip.text.split("\n").length * font.charHeight * 1.33) + 3 // .match() and matchAll() are not present; .split() is memory inefficient
            })
        }
    }
}