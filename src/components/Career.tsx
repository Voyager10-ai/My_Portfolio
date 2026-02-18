import { config } from "../config";
import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section" id="career">
      <h2 className="section-title">
        Experience <span>&</span> Education
      </h2>

      <div className="timeline-container">
        {/* The vertical glowing line */}
        <div className="timeline-line"></div>

        {config.experiences.map((exp, index) => (
          <div key={index} className="timeline-row">
            {/* Left Column: Title + Subtitle */}
            <div className="timeline-left">
              <h3 className="timeline-title">{exp.position}</h3>
              <h4 className="timeline-subtitle">{exp.company}</h4>
            </div>

            {/* Center Column: Year + Dot */}
            <div className="timeline-center">
              <div className="timeline-dot"></div>
              <span className="timeline-year">{exp.period}</span>
            </div>

            {/* Right Column: Description */}
            <div className="timeline-right">
              <p className="timeline-description">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Career;
