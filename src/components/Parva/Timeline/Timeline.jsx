
import register from "../../../icons/register.svg";
import location from "../../../icons/location.svg";
import time from "../../../icons/time.svg";
import "./Timeline.css";
import { parva } from "../../../data/data";

const Timeline = () => {
    return (
        <div className="schedule p-4">
            <h2 className="font-weight-bold white-txt heading-text text-center">
                <span className="gold-txt">Parva</span> {" "} Timeline
            </h2>
            <div className="schedule-container mx-auto">
                {
                    parva.timeline.map((item) => (
                        <div class="schedule-item">
                            <span class="schedule-item-time">
                                {item.date}
                            </span>
                            <div class="schedule-item-desc">
                                <div className="d-flex flex-column">
                                    <h3 class="schedule-item-desc-title mb-2">{item.title}</h3>
                                    <div className="d-flex gap-2 flex-wrap">
                                        {
                                            item.time.length !== 0 && (
                                                <span>
                                                    <img src={time} alt="time" height="16" />
                                                    <small class="schedule-item-desc-text" style={{ margin: "0 0 0 4px" }}>{item.time}</small>
                                                </span>
                                            )
                                        }
                                        {
                                            item.location.length !== 0 && (
                                                <span>
                                                    <img src={location} alt="location" height="16" />
                                                    <small class="schedule-item-desc-text" style={{ margin: "0 0 0 4px" }}>{item.location}</small>
                                                </span>
                                            )
                                        }
                                    </div>
                                    {
                                        item.register.length !== 0 && (
                                            <small>
                                                <img src={register} alt="register" height="16" />
                                                <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={item.register}
                                                    style={{ margin: "0 0 0 4px" }}
                                                >
                                                    Register
                                                </a>
                                            </small>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Timeline
