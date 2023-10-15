import React from 'react'
import { alumniList } from '../../data/data'
import AlumniCard from '../AlumniCard/AlumniCard'
import "./Alumni.css"
import Metadata from '../MetaData/MetaData'

const Alumni = () => {
  return (
    <>
      <Metadata title="Alumni | Kannada Vedike" />
      <div id="alumni" className="section mt-6">
        <h2
          className="mt-4 pt-4 text-center font-weight-bold primary-text-clr title aos-init aos-animate"
          data-aos="fade"
        >
          Alumni
        </h2>
        <div className="main-container">
          {
            alumniList.map((alumni, idx) => <AlumniCard alumni={alumni} key={"alumni" + idx + alumni.name} />)
          }
        </div>
      </div>
    </>
  )
}

export default Alumni
