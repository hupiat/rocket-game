import React, { Component } from 'react'
import Sound from 'react-sound'
import Player from '../Player/Player'
import Wall from '../Wall/Wall'
import HUD from '../HUD/HUD'
import Background from './Background.png'
import Music from './Music.mp3'
import * as DefaultConstants from '../../Constants/DefaultConstants'
import * as KeyCodes from '../../Constants/KeyCodes'

const style = {
    height: '100vh',
    width: '100vw',
    backgroundImage: `url(${Background})`
}

const BASE_STATE = {
    walls: [],
    lives: DefaultConstants.ROCKET_LIVES_NUMBER,
    score: 0,
    isLosingLives: false,
    isPaused: false
}

// Number of generated walls at the start
const WALLS_NUMBER = 10

// Value used to multiply the index when rendering the walls, representing the space between each one
const WALLS_SPACE = 100

// Value representing the walls shift at each iteration 
const SHIFT_INCREMENT = 5

// Value representing the time between each iteration
const TIMEOUT_INCREMENT = 20

export default class Game extends Component {

    constructor(props) {
        super(props)
        this.state = JSON.parse(JSON.stringify(BASE_STATE))
        this.walls = []
        this.start = this.start.bind(this)
    }

    componentDidMount() {
        this.start()

        // Adding event for pause menu
        window.addEventListener('keydown', e => {
            if (e.keyCode === KeyCodes.ESCAPE && this.state.lives > 0) {
                this.setState({
                    isPaused: !this.state.isPaused
                }, () => {
                    if (this.state.isPaused) {
                        this.player.setKeyEvents(false)
                    } else {
                        this.player.setKeyEvents()
                        this.timeout()
                    }
                })
            }
        })
    }

    /**
     * Start the game by generating the walls and initializing lives and score.
     * A timeout callback is fired in loop to move the walls, stopping when the
     * player lose the game
     */
    start() {
        let shift = 0
        this.timeout = () => {
            // Incrementing the walls shift
            shift += SHIFT_INCREMENT
            this.renderWalls(shift)

            // Incrementing the score each time a wall is passed
            if (shift % WALLS_SPACE === 0) {
                this.setState({
                    score: this.state.score + 1
                })
            }       

            // Then firing the next callback only if the player has at least one life
            if (this.state.lives > 0 && !this.state.isPaused) {
                setTimeout(this.timeout, TIMEOUT_INCREMENT)
            }
        }

        const state = JSON.parse(JSON.stringify(BASE_STATE))

        // Generating start walls
        for (let i = 1; i <= WALLS_NUMBER; i++) {
            state.walls.push(Wall.generate(i * WALLS_SPACE, this.walls))
        }
        
        this.player.setKeyEvents()

        this.setState(state, this.timeout)
    }
    
    /**
     * Handle the walls rendering at each timeout callback iteration by updating walls left positions
     * @param {number} shift current shift value for the walls left position, higher at each iteration (0 by default)
     */
    renderWalls(shift = 0) {
        let walls = []

        for (const wall of this.state.walls) {
            // Updating each wall left position and taking old values for other properties
            const left = wall.props.left - SHIFT_INCREMENT
            if (left > 0 - DefaultConstants.WALL_BLOCKS_WIDTH_PX) {
                walls.push(
                    <Wall key={wall.key} 
                        left={left} 
                        length={wall.props.length} 
                        direction={wall.props.direction} 
                        ref={w => this.walls[wall.key] = w} />
                )
            }
        }

        // Handling infinite generation of walls
        const maxWallsOnScreen = window.screen.width / (WALLS_SPACE + DefaultConstants.WALL_BLOCKS_WIDTH_PX)
        if (shift % WALLS_SPACE === 0 && this.state.score > WALLS_NUMBER - maxWallsOnScreen) {
            walls.push(Wall.generate(window.screen.width, this.walls))
        } 

        this.setState({
            walls: walls
        }, () => {
            if (this.player && !this.state.isLosingLives) {
                this.checkCollisions()
            }
        })
    }

    /**
     * For each timeout callback iteration, check if the player is hitting a wall
     */
    checkCollisions() {
        let wall
        for (const key in this.walls) {

            // Getting the wall on which the player is passing through
            const w = this.walls[key]
            if (w) {
                const fitRocketPos = w.props.left <= DefaultConstants.ROCKET_LEFT_POSITION + DefaultConstants.ROCKET_WIDTH_PX 
                    && w.props.left >= DefaultConstants.ROCKET_LEFT_POSITION - DefaultConstants.ROCKET_WIDTH_PX

                if (fitRocketPos) {
                    wall = w
                    break
                } 
            }
        }

        if (wall && wall.checkCollision(this.player.state.position)) {
            this.loseLives()
        }
    }

    /**
     * Makes the player losing lives and blinking for a defined time
     * @param {number} lives number of lives to take from the player (1 by default)
     */
    loseLives(livesLost = 1) {
        this.setState({
            lives: this.state.lives - livesLost,
            isLosingLives: true
        }, () => {
            if (this.state.lives <= 0) {
                this.player.setKeyEvents(false)
            } else {
                setTimeout(() => this.setState({
                    isLosingLives: false
                }), DefaultConstants.ROCKET_IMMUNE_TIME_MS)
            }
        })
    }
    
    render() {
        return (
            <div style={style}>

                { this.state.walls }

                <Player 
                    ref={child => this.player = child}
                    isBlinking={this.state.isLosingLives} />

                <HUD 
                    lives={this.state.lives} 
                    score={this.state.score} 
                    menu={this.state.isPaused}
                    retryMenu={this.state.lives <= 0}
                    onRetry={this.start} />

                <Sound 
                    url={Music}
                    playStatus={Sound.status.PLAYING}/>
            </div>
        )
    }
    
}