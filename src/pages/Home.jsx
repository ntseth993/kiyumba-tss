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
          <h1 className="hero-title fade-in">Welcome to Kiyumba Technical School</h1>
          <p className="hero-subtitle fade-in">
            Transform your future with professional technical education. Learn Software Development, 
            Fashion Design, Building Construction, or Wood Technology at levels L3, L4, and L5.
          </p>
          <div className="hero-buttons fade-in">
            <Link to="/register" className="btn btn-primary btn-large">
              Apply Now
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
          <h2 className="section-title">Our Technical Programs</h2>
          <p className="section-subtitle">
            Professional technical education across levels L3, L4, and L5
          </p>

          <div className="programs-grid">
            <div className="program-card card">
              <h3>Software Development</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Web Development</li>
                <li><CheckCircle size={20} /> Mobile Apps</li>
                <li><CheckCircle size={20} /> Database Management</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>

            <div className="program-card card featured">
              <div className="featured-badge">Most Popular</div>
              <h3>Fashion & Design</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Pattern Making</li>
                <li><CheckCircle size={20} /> Garment Construction</li>
                <li><CheckCircle size={20} /> Fashion Illustration</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Apply Now</Link>
            </div>

            <div className="program-card card">
              <h3>Building Construction</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Structural Design</li>
                <li><CheckCircle size={20} /> Construction Methods</li>
                <li><CheckCircle size={20} /> Site Management</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>

            <div className="program-card card">
              <h3>Wood Technology</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Carpentry Skills</li>
                <li><CheckCircle size={20} /> Furniture Design</li>
                <li><CheckCircle size={20} /> Wood Processing</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join Kiyumba Technical School?</h2>
            <p>
              Start your journey towards professional technical excellence. 
              Apply now and transform your future with hands-on training.
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              Apply Now
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
