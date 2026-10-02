import Phaser from 'phaser'
import { ForecourtScene } from '@p26/market/world/forecourt-scene'

// Starts the forecourt in `parent` and returns the game, which the page
// destroys when it leaves. This file is the only way into Phaser, so the
// page loads it on its own (and only for this page).
//
// 30 frames a second is plenty for a walk and keeps a phone cool; the loop
// stops by itself while the tab is hidden.
export function startGame({ parent, character, layout, onNear, onAction }) {
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
    scene: new ForecourtScene({ character, layout, onNear, onAction }),
  })
}
