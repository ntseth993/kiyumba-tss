import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Users, Award, Lightbulb, ArrowRight, CheckCircle } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title fade-in">Welcome to Kiyumba School</h1>
          <p className="hero-subtitle fade-in">
            Empowering students through excellence in education, fostering innovation, 
            and building tomorrow's leaders today.
          </p>
          <div className="hero-buttons fade-in">
            <Link to="/login" className="btn btn-primary btn-large">
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link to="/about" className="btn btn-outline btn-large">
              Learn More
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-placeholder">
            <BookOpen size={120} strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Kiyumba?</h2>
          <p className="section-subtitle">
            We provide world-class education with a focus on holistic development
          </p>

          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">
                <BookOpen size={40} />
              </div>
              <h3>Quality Education</h3>
              <p>
                Comprehensive curriculum designed to meet international standards 
                and prepare students for global opportunities.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Users size={40} />
              </div>
              <h3>Expert Teachers</h3>
              <p>
                Highly qualified and dedicated educators committed to nurturing 
                each student's potential and academic excellence.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Award size={40} />
              </div>
              <h3>Excellence Awards</h3>
              <p>
                Recognized for outstanding academic achievements and innovative 
                teaching methodologies across the region.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Lightbulb size={40} />
              </div>
              <h3>Modern Facilities</h3>
              <p>
                State-of-the-art classrooms, laboratories, and technology to 
                enhance the learning experience for all students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3 className="stat-number">1500+</h3>
              <p className="stat-label">Active Students</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">120+</h3>
              <p className="stat-label">Qualified Teachers</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">95%</h3>
              <p className="stat-label">Success Rate</p>
            </div>
            <div className="stat-item">
              <h3 className="stat-number">50+</h3>
              <p className="stat-label">Awards Won</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="programs">
        <div className="container">
          <h2 className="section-title">Our Programs</h2>
          <p className="section-subtitle">
            Comprehensive educational programs for every student
          </p>

          <div className="programs-grid">
            <div className="program-card card">
              <h3>Primary Education</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Foundation curriculum</li>
                <li><CheckCircle size={20} /> Interactive learning</li>
                <li><CheckCircle size={20} /> Character development</li>
                <li><CheckCircle size={20} /> Creative activities</li>
              </ul>
              <button className="btn btn-outline">Learn More</button>
            </div>

            <div className="program-card card featured">
              <div className="featured-badge">Most Popular</div>
              <h3>Secondary Education</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Advanced curriculum</li>
                <li><CheckCircle size={20} /> Career guidance</li>
                <li><CheckCircle size={20} /> University preparation</li>
                <li><CheckCircle size={20} /> Leadership training</li>
              </ul>
              <button className="btn btn-primary">Learn More</button>
            </div>

            <div className="program-card card">
              <h3>Extra Curricular</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Sports activities</li>
                <li><CheckCircle size={20} /> Arts & music</li>
                <li><CheckCircle size={20} /> Clubs & societies</li>
                <li><CheckCircle size={20} /> Community service</li>
              </ul>
              <button className="btn btn-outline">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join Kiyumba School?</h2>
            <p>
              Take the first step towards an excellent education. 
              Login to access your student or admin dashboard.
            </p>
            <Link to="/login" className="btn btn-primary btn-large">
              Login Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
