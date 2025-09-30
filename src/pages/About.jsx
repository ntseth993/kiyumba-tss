import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Award, Target, Eye, Users } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1 className="fade-in">About Kiyumba School</h1>
          <p className="fade-in">
            A legacy of excellence in education since 1995
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="our-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-image">
              <div className="story-image-placeholder">
                <Users size={80} strokeWidth={1} />
              </div>
            </div>
            <div className="story-content">
              <h2>Our Story</h2>
              <p>
                Founded in 1995, Kiyumba School has been at the forefront of quality education
                for nearly three decades. What started as a small community school with just
                50 students has grown into one of the region's most respected educational institutions,
                serving over 1,500 students annually.
              </p>
              <p>
                Our commitment to academic excellence, combined with a focus on character
                development and holistic growth, has helped thousands of students achieve their
                dreams and become leaders in their communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card card">
              <div className="mv-icon">
                <Target size={40} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To provide exceptional education that empowers students with knowledge,
                skills, and values needed to excel academically and contribute meaningfully
                to society. We strive to create a nurturing environment where every student
                can reach their full potential.
              </p>
            </div>

            <div className="mv-card card">
              <div className="mv-icon">
                <Eye size={40} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To be the leading educational institution recognized for academic excellence,
                innovation in teaching, and producing well-rounded graduates who are prepared
                to face global challenges and make a positive impact in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-item card">
              <div className="value-number">01</div>
              <h3>Excellence</h3>
              <p>
                We pursue the highest standards in everything we do, encouraging students
                and staff to achieve their personal best.
              </p>
            </div>

            <div className="value-item card">
              <div className="value-number">02</div>
              <h3>Integrity</h3>
              <p>
                We uphold honesty, transparency, and ethical behavior in all our interactions
                and decisions.
              </p>
            </div>

            <div className="value-item card">
              <div className="value-number">03</div>
              <h3>Innovation</h3>
              <p>
                We embrace creative thinking and modern teaching methods to prepare students
                for a rapidly changing world.
              </p>
            </div>

            <div className="value-item card">
              <div className="value-number">04</div>
              <h3>Respect</h3>
              <p>
                We value diversity and foster an inclusive environment where everyone is
                treated with dignity and respect.
              </p>
            </div>

            <div className="value-item card">
              <div className="value-number">05</div>
              <h3>Community</h3>
              <p>
                We build strong partnerships with families and the community to support
                student success and development.
              </p>
            </div>

            <div className="value-item card">
              <div className="value-number">06</div>
              <h3>Leadership</h3>
              <p>
                We develop leadership skills in our students, preparing them to be positive
                change-makers in society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="achievements">
        <div className="container">
          <h2 className="section-title">Our Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement-card card">
              <Award size={48} />
              <h3>National Excellence Award</h3>
              <p>Best School in Academic Performance 2023</p>
            </div>

            <div className="achievement-card card">
              <Award size={48} />
              <h3>Innovation in Education</h3>
              <p>Recognized for Modern Teaching Methods 2022</p>
            </div>

            <div className="achievement-card card">
              <Award size={48} />
              <h3>Community Impact</h3>
              <p>Outstanding Community Service Award 2023</p>
            </div>

            <div className="achievement-card card">
              <Award size={48} />
              <h3>Sports Excellence</h3>
              <p>Regional Sports Championship Winners 2023</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
