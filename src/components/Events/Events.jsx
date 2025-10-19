import React from 'react'
import './Events.css'
import Cards from '../Cards/Cards'
import Metadata from '../MetaData/MetaData.jsx'
import { eventsList, upcomingEvents } from '../../data/data'



const Events = () => {
  return (
    <>
      <Metadata title="Events | Kannada Vedike" />
      <div className="page section">
        <h2 className="text-center font-weight-bold primary-text-clr title pt-5"> Events</h2>
        <div className="pageContainer content">
          {
            eventsList.map((event, idx) => 
            <Cards title={event.title} desc={event.desc} img={event.img} link={event.link} key={'e' + idx} />
          )}
        </div>
        <h2 className="text-center font-weight-bold title pt-5"> Upcoming Events</h2>
        <div className="pageContainer content">
          {
            upcomingEvents.map((event, idx) => 
            <Cards title={event.title} desc={event.desc} img={event.img} link={event.link} key={'e' + idx} />
          )}
        </div>
      </div>
    </>
  )
}

export default Events