import React, { Component } from 'react'

/**
 * Properties : 
 * 
 * image = image url
 * top = top position in px (number)
 * left = left position in px (number)
 */
export default class Element extends Component {

    render() {
        const style = {
            position: 'absolute',
            top: `${this.props.top}px`,
            left: `${this.props.left}px`,
            ...this.props.style
        }

        return <img src={this.props.image} alt={this.props.image} style={style} />
    }
}