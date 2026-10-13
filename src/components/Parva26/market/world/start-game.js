import Phaser from 'phaser'
import { ForecourtScene } from '@p26/market/world/forecourt-scene'

// Starts the forecourt in `parent` and returns the game, which the page
// destroys when it leaves. This file is the only way into Phaser, so the
// page loads it on its own, once the market is close to the screen.
//
// The game sits inside a scrolling page, so it never takes the page's input
// for itself: keys are heard only while `keyTarget` (the game box) has
// focus, the wheel always scrolls the page, and touches are left to the
// browser, so a swipe that starts on the game still scrolls.
//
// 30 frames a second is plenty for a walk and keeps a phone cool; the loop
// stops by itself while the tab is hidden.
export function startGame({ parent, keyTarget, character, layout, visited, onNear, onAction }) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: layout.width,
    height: layout.height,
    backgroundColor: '#140c08',
    banner: false,
    audio: { noAudio: true },
    fps: { target: 30, limit: 30 },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true },
    input: {
      keyboard: { target: keyTarget },
      mouse: { preventDefaultWheel: false },
      touch: { capture: false },
    },
    scene: new ForecourtScene({ character, layout, visited, onNear, onAction }),
  })
}
