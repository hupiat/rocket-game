import React, { Component, Fragment } from 'react'
import Sound from 'react-sound'
import Element from '../Element/Element'
import RocketImage from './Rocket.gif'
import HitSound from './HitSound.mp3'
import * as DirectionConstants from '../../Constants/DirectionConstants'
import * as DefaultConstants from '../../Constants/DefaultConstants'
import * as KeyCodes from '../../Constants/KeyCodes'
import './Player.css'

const style = {
    width: `${DefaultConstants.ROCKET_WIDTH_PX}px`,
    height: `${DefaultConstants.ROCKET_HEIGHT_PX}px`,
    transform: 'rotate(90deg)'
}

// Shift value in px used when the player vertical position is updated
const KEY_PRESS_SHIFT = 25

/**
 * Properties :
 * 
 * isBlinking = boolean value indicating if the rocket should have a blink animation
 */
export default class Player extends Component {

    constructor(props) {
        super(props)
        this.state = {
            position: DefaultConstants.ROCKET_TOP_POSITION,
        }

        // The events listener is stored to be deactivate and reactivate
        this.keysListener = e => {
            if (e.keyCode === KeyCodes.ARROW_UP) {
                this.move(DirectionConstants.TOP)
            } 
            if (e.keyCode === KeyCodes.ARROW_DOWN) {
                this.move(DirectionConstants.BOTTOM)
            }
        }
    }

    /**
     * Set global key events to move the player
     * @param {boolean} active indicate if the events should be add or removed (true by default)
     */
    setKeyEvents(active = true) {
        if (active) {
            window.addEventListener('keydown', this.keysListener)
        } else {
            window.removeEventListener('keydown', this.keysListener)
        }
    }

    /**
     * Handle player vertical position update when a key is pressed
     * @param {string} direction bottom or top constants (top by default)
     */
    move(direction = DirectionConstants.TOP) {
        let newPosition = this.state.position

        if (direction === DirectionConstants.TOP) {
            newPosition -= KEY_PRESS_SHIFT
        }
        if (direction === DirectionConstants.BOTTOM) {
            newPosition += KEY_PRESS_SHIFT
        }

        this.setState({
            position: newPosition
        })
    }

    render() {
        if (this.props.isBlinking) {
            style.animation = 'blink 1s linear infinite'
        } else {
            style.animation = ''
        }

        const hitSound = this.props.isBlinking ? Sound.status.PLAYING : Sound.status.STOPPED

        return (
            <Fragment>
                <Element 
                    image={RocketImage} 
                    style={style} 
                    left={DefaultConstants.ROCKET_LEFT_POSITION} 
                    top={this.state.position} />

                <Sound
                    url={HitSound}
                    playStatus={hitSound} 
                    loop={false} />
            </Fragment>
        )
    }
}