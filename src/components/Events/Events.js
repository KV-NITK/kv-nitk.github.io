import React from 'react'
import './Events.css'
import Cards from '../Cards/Cards'
import Metadata from '../MetaData/MetaData'
import { eventsList } from '../../data/data'



const Events = () => {
  return (
    <>
      <Metadata title="Events | Kannada Vedike" />
      <div className="page">
        <h2 className="text-center font-weight-bold primary-text-clr title pt-5"> Events</h2>
        <div className="pageContainer content">
          {
            eventsList.map((event, idx) => 
            <Cards title={event.title} desc={event.desc} img={event.img} link={event.link} key={'e' + idx} />
          )}
        </div>
      </div>
    </>
  )
}

export default Events