import React from 'react'
import './Social.css'
import Cards from '../Cards/Cards'
import Metadata from '../MetaData/MetaData.jsx'
import { socialList } from '../../data/data'

const Social = () => {
    return (
        <>
            <Metadata title="Social Activities | Kannada Vedike" />
            <div className="page section">
                <h2 className="text-center font-weight-bold primary-text-clr title pt-5"> Social Activities</h2>
                <div className="pageContainer content">
                    {
                        socialList.map((event, idx) => {
                            return <Cards title={event.title} desc={event.desc} img={event.img} link={event.link} key={'e' + idx} ></Cards>
                        })
                    }
                </div>
            </div>
        </>
    )
}

export default Social