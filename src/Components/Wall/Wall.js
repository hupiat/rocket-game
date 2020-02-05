import React, { Component } from 'react'
import Element from '../Element/Element'
import WallImage from './Wall.png'
import * as DefaultConstants from '../../Constants/DefaultConstants'
import * as DirectionConstants from '../../Constants/DirectionConstants'

// Handle consistency for many walls generated next to each other
// Increasing this value will make the game easier to play
const GENERATION_TOLERANCE = 3

/**
 * Properties : 
 * 
 * length = number of blocks (number)
 * left = left position in px (number)
 * direction = constant value to indicate if the wall is starting from the bottom or top
 */
export default class Wall extends Component {

    /**
     * Generate a wall with random values for a given position
     * A mask system is used to handle the generations and provide a better gameplay
     * @param {number} left left position in px
     * @param {object} reference optional array reference to store the element reference,
     * the index of the reference is the generated key for this element
     * @returns generated element
     */
    static generate(left, reference = []) {
        const key = Math.random()

        // Defining wall length
        let length = Math.floor(Math.random() * (DefaultConstants.WALL_BLOCKS_MAX_LENGTH - 1) + 1)

        // Defining if the wall is starting from the top or the bottom
        const randomIdx = Math.floor(Math.random() * Math.floor(2))
        const direction = randomIdx % 2 === 0 ? DirectionConstants.TOP : DirectionConstants.BOTTOM

        if (GENERATION_TOLERANCE > 0) {
            // Handling length using generation mask
            if (this._generationTolerance && this._generationTolerance.direction !== direction) {
                while (Math.abs(this._generationTolerance.length - length) < GENERATION_TOLERANCE && length > 1) {
                    length--
                }
            }
            // Storing mask
            this._generationTolerance = {
                length: length,
                direction: direction
            }
        }

        return <Wall key={key} length={length} left={left} direction={direction} ref={w => reference[key] = w} />
    }

    /**
     * Check if the player is vertically hitting this wall
     * @param {number} top player top position in px
     * @returns true if the elements are hitting each other, false otherwise
     */
    checkCollision(top) {
        const wallHeightPx = this.props.length * DefaultConstants.WALL_BLOCKS_HEIGHT_PX

        if (this.props.direction === DirectionConstants.TOP) {
            // If the wall is starting from the top
            if (top - (wallHeightPx - DefaultConstants.ROCKET_HEIGHT_PX / 2) <= 0) {
                return true
            }
        }
        if (this.props.direction === DirectionConstants.BOTTOM) {
            // If the wall is starting from the bottom
            const bottomCompensation = DefaultConstants.WALL_BLOCKS_HEIGHT_PX
            if ((window.screen.height - wallHeightPx) - (top + DefaultConstants.ROCKET_HEIGHT_PX + bottomCompensation) <= 0) {
                return true
            }
        }

        return false
    } 

    /**
     * Build the wall by putting many blocks next to each other
     */
    renderBlocks() {
        const blocks = []

        for (let i = 0; i < this.props.length; i++) {
            const blockStyle = {
                width: `${DefaultConstants.WALL_BLOCKS_WIDTH_PX}px`,
                height: `${DefaultConstants.WALL_BLOCKS_HEIGHT_PX}px`
            }
            
            // Setting block vertical position
            const shift = i * DefaultConstants.WALL_BLOCKS_HEIGHT_PX

            if (this.props.direction === DirectionConstants.TOP) {
                // Increasing the top shift
                blockStyle.top = `${shift}px`
            }
            if (this.props.direction === DirectionConstants.BOTTOM) {
                // Reducing the top shift
                blockStyle.top = `calc(95vh - ${shift}px)`
            }

            blocks.push(
                <Element key={i} image={WallImage} style={blockStyle} left={this.props.left} />
            )
        }

        return blocks
    }

    render() {
        return (
            <>
                { this.renderBlocks() }
            </>
        )
    }
}