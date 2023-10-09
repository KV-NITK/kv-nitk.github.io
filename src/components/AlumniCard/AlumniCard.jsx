import React from 'react'

const AlumniCard = ({alumni}) => {
    return (
        <div className="alum-card" key={"alumni" + alumni.name}>
            <img src={alumni.img}
                alt="no alt" />
                <div className="content">
                    <div className="desc">
                        <div className="name">{alumni.name}</div>
                        <div className="batch">{alumni.batch} Batch</div>
                    </div>
                    <div className="social">
                        <a href={alumni.linkedIn} target='norefer'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                    d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                            </svg>
                        </a>
                        <a href={"mailto:" + alumni.mail}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path
                                    d="M12 .02c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.99 6.98l-6.99 5.666-6.991-5.666h13.981zm.01 10h-14v-8.505l7 5.673 7-5.672v8.504z" />
                            </svg>
                        </a>
                    </div>
                </div>
        </div>
    )
}

export default AlumniCard
