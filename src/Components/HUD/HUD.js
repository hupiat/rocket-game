import React, { Component, Fragment } from 'react'
import HeartImage from './Heart.png'

const styles = {
    heart: {
        position: 'relative',
        zIndex: '10',
        width: '50px',
        height: '50px'
    },
    score: {
        position: 'absolute',
        zIndex: '10',
        color: 'white',
        left: '95vw',
        top: '1vh',
        fontSize: '150%'
    },
    menu: {
        position: 'absolute',
        zIndex: '10',
        color: 'white',
        top: '30vh',
        left: '43vw',
        textAlign: 'center'
    }
}

const GAME_OVER_TEXT = 'GAME OVER'

const SCORE_TEXT = 'Your score : '

const RETRY_TEXT = 'Try again'

const PAUSE_TEXT = 'PAUSE'

/**
 * Properties :
 * 
 * lives = lives (number)
 * score = score (number)
 * menu = indicate if the player has paused the game (boolean)
 * retryMenu = indicate if the player lost the game (boolean)
 * onRetry = callback fired when the player click on the retry button
 */
export default class HUD extends Component {

    renderLives() {
        const lives = []

        for (let i = 0; i < this.props.lives; i++) {
            lives.push(
                <img src={HeartImage} key={i} alt={`heart-${i}`} style={styles.heart} />
            )
        }

        return lives
    }

    renderScore() {
        return (
            <b style={styles.score}>
                { this.props.score }
            </b>
        )
    }

    renderMenu(retry = false) {
        return (
            <div style={styles.menu}>
                <h1>{ retry ? GAME_OVER_TEXT : PAUSE_TEXT }</h1>
                
                <h3>{ SCORE_TEXT } { this.props.score }</h3>

                <button onClick={() => {
                    if (this.props.onRetry) {
                        this.props.onRetry()
                    }
                }}>{ RETRY_TEXT }</button>
            </div>
        )
    }

    render() {
        return (
            <Fragment>
                { !this.props.retryMenu && this.renderLives() }
                { !this.props.retryMenu && !this.props.menu && this.renderScore() }
                { this.props.menu && !this.props.retryMenu && this.renderMenu() }
                { this.props.retryMenu && this.renderMenu(true) }
            </Fragment>
        )
    }
}