import React from 'react'
import './Cards.css'
import { Link } from 'react-router-dom'

const Cards = ({title,img,desc,link}) => {
  return (
    <figure
      className="image-block events-card aos-init aos-animate"
      data-aos="fade"
    >
      <img src={img} alt="" />
      <figcaption>
        <h4 className="text-center mb-3">{title}</h4>
        <p>
          {desc}
        </p>
      </figcaption>
    </figure>
  )
}

export default Cards
